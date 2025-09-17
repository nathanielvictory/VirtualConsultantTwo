"""
Minimal RabbitMQ worker (listen-only) with graceful shutdown.
- Declares durable topic exchange and per-routing-key durable queues.
- Auto-discovers handlers from worker.listeners package; no worker edits needed to add/remove keys.
"""
from __future__ import annotations

import logging
import signal

import pika

from config import settings
from worker.listeners import HANDLERS

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


class Worker:
    def __init__(self) -> None:
        self.exchange = settings.RABBIT_EXCHANGE
        self._conn: pika.BlockingConnection | None = None
        self._ch: pika.adapters.blocking_connection.BlockingChannel | None = None
        self._queues: list[str] = []

    def _request_stop(self, *_: object) -> None:
        try:
            if self._ch and self._ch.is_open:
                logger.info("Shutdown signal received — stopping consumer…")
                self._ch.stop_consuming()
        except Exception:
            pass

    def connect(self) -> None:
        creds = pika.PlainCredentials(settings.RABBIT_USER, settings.RABBIT_PASS)
        params = pika.ConnectionParameters(
            host=settings.RABBIT_HOST,
            port=settings.RABBIT_PORT,
            virtual_host=settings.RABBIT_VHOST,
            credentials=creds,
            heartbeat=300,
            blocked_connection_timeout=60,
        )
        self._conn = pika.BlockingConnection(params)
        ch = self._conn.channel()
        self._ch.basic_qos(prefetch_count=1)

        ch.exchange_declare(exchange=self.exchange, exchange_type="topic", durable=True)

        # One queue per routing key, named "<routing_key>.q"
        for rk in HANDLERS.keys():
            q = f"{rk}.q"
            ch.queue_declare(queue=q, durable=True)
            ch.queue_bind(queue=q, exchange=self.exchange, routing_key=rk)
            self._queues.append(q)

        self._ch = ch
        logger.info("Connected. exchange=%s queues=%s", self.exchange, ",".join(self._queues))

    def close(self) -> None:
        try:
            if self._ch and self._ch.is_open:
                self._ch.close()
        finally:
            if self._conn and self._conn.is_open:
                self._conn.close()
            logger.info("Connection closed.")

    def run(self) -> None:
        self.connect()
        assert self._ch is not None

        signal.signal(signal.SIGTERM, self._request_stop)
        signal.signal(signal.SIGINT, self._request_stop)

        def on_message(ch, method, properties, body) -> None:
            handler = HANDLERS.get(method.routing_key)
            if handler:
                handler(body)
            else:
                logger.info("no handler for %r: %r", method.routing_key, body)
            ch.basic_ack(delivery_tag=method.delivery_tag)

        for q in self._queues:
            self._ch.basic_consume(queue=q, on_message_callback=on_message, auto_ack=False)

        try:
            self._ch.start_consuming()
        finally:
            self.close()


if __name__ == "__main__":
    Worker().run()

# worker/async_worker.py
import asyncio
import logging
import signal
from contextlib import suppress
from typing import Awaitable, Callable, Dict, Set

import aio_pika
from aio_pika import ExchangeType, IncomingMessage

from config import settings, setup_logging
from worker.listeners import HANDLERS  # type: Dict[str, Callable[[bytes], Awaitable[None]]]

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


class Worker:
    def __init__(self) -> None:
        self.exchange_name = settings.RABBIT_EXCHANGE
        self.queue_name = f"{self.exchange_name}.worker"
        self.max_in_flight = 10  # <= desired concurrency
        self._sem = asyncio.Semaphore(self.max_in_flight)
        self._tasks: Set[asyncio.Task] = set()

        self._conn: aio_pika.RobustConnection | None = None
        self._ch: aio_pika.abc.AbstractChannel | None = None
        self._exchange: aio_pika.abc.AbstractExchange | None = None
        self._queue: aio_pika.abc.AbstractQueue | None = None
        self._stopping = asyncio.Event()

    async def connect(self) -> None:
        self._conn = await aio_pika.connect_robust(
            host=settings.RABBIT_HOST,
            port=settings.RABBIT_PORT,
            virtualhost=settings.RABBIT_VHOST,
            login=settings.RABBIT_USER,
            password=settings.RABBIT_PASS,
            heartbeat=300,   # 5 minutes
            timeout=60,
        )
        self._ch = await self._conn.channel()
        await self._ch.set_qos(prefetch_count=self.max_in_flight)

        self._exchange = await self._ch.declare_exchange(
            self.exchange_name, ExchangeType.TOPIC, durable=True
        )
        self._queue = await self._ch.declare_queue(self.queue_name, durable=True)
        for rk in HANDLERS.keys():
            await self._queue.bind(self._exchange, routing_key=rk)

        logger.info(
            "Connected. exchange=%s queue=%s keys=%s prefetch=%d heartbeat=%ds",
            self.exchange_name,
            self._queue.name,
            ",".join(HANDLERS.keys()),
            self.max_in_flight,
            300,
        )

    async def close(self) -> None:
        with suppress(Exception):
            if self._ch and not self._ch.is_closed:
                await self._ch.close()
        with suppress(Exception):
            if self._conn and not self._conn.is_closed:
                await self._conn.close()
        logger.info("Connection closed.")

    def _install_signal_handlers(self) -> None:
        loop = asyncio.get_running_loop()

        def _request_stop() -> None:
            if not self._stopping.is_set():
                logger.info("Shutdown signal received — stopping consumer…")
                self._stopping.set()

        for sig in (signal.SIGINT, signal.SIGTERM):
            with suppress(NotImplementedError):
                loop.add_signal_handler(sig, _request_stop)

    async def _on_message(self, message: IncomingMessage) -> None:
        # Limit concurrent handler executions
        await self._sem.acquire()

        async def _run_one(msg: IncomingMessage) -> None:
            try:
                async with msg.process(requeue=False):
                    handler = HANDLERS.get(msg.routing_key)
                    if not handler:
                        logger.info("no handler for %r: %r", msg.routing_key, msg.body)
                        return
                    await handler(msg.body)  # all handlers are async now
            except Exception as e:
                # With process(requeue=False), failures are rejected (removed, no requeue).
                logger.warning("Exception %r on %s: %r", e, msg.routing_key, msg.body)
            finally:
                self._sem.release()

        task = asyncio.create_task(_run_one(message))
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)

    async def run(self) -> None:
        await self.connect()
        assert self._queue is not None
        self._install_signal_handlers()

        consume_tag = await self._queue.consume(self._on_message, no_ack=False)

        try:
            await self._stopping.wait()
        finally:
            # stop delivering new messages
            with suppress(Exception):
                await self._queue.cancel(consume_tag)

            # wait for in-flight tasks to finish (bounded by a timeout if you prefer)
            if self._tasks:
                logger.info("Waiting for %d in-flight task(s) to finish…", len(self._tasks))
                await asyncio.gather(*self._tasks, return_exceptions=True)

            await self.close()


async def main() -> None:
    setup_logging()
    worker = Worker()
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())

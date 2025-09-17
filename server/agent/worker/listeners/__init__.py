from importlib import import_module
from pkgutil import iter_modules
from pathlib import Path

HANDLERS = {}

_pkg_path = Path(__file__).parent
for m in iter_modules([str(_pkg_path)]):
    if m.name.startswith("_"):
        continue
    mod = import_module(f"{__name__}.{m.name}")
    rk = getattr(mod, "ROUTING_KEY", None)
    fn = getattr(mod, "handle", None)
    if rk and callable(fn):
        HANDLERS[rk] = fn

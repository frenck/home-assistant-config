import logging


class LogMixin:
    """Log helper."""

    def log(self, level, msg, *args):
        """Log with level."""
        raise NotImplementedError

    def debug(self, msg, *args):
        """Debug level log."""
        return self.log(logging.DEBUG, msg, *args)

    def info(self, msg, *args):
        """Info level log."""
        return self.log(logging.INFO, msg, *args)

    def warning(self, msg, *args):
        """Warning method log."""
        return self.log(logging.WARNING, msg, *args)

    def error(self, msg, *args):
        """Error level log."""
        return self.log(logging.ERROR, msg, *args)

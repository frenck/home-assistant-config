# This is a highly experimental integration, use at your own risk!
#
# This integration ties up the Home Assistant conversation
# integration with the telegram_bot integration.
#
# If you have Telegram & Almond installed and configured,
# this integration will hook them up together.
#
# It passes chat flowing in from Telegram into Almond
# and sending back the response.
#
# This allows you to "Talk" to your Home Assistant in
# a more natural "Human" language.
#
# Requires telegram_bot to be set up.
#
from homeassistant.core import Context, Event, HomeAssistant
from homeassistant.components.conversation import _async_converse
from homeassistant.components.telegram_bot import (
    ATTR_CHAT_ID,
    ATTR_MESSAGE,
    ATTR_TARGET,
    ATTR_TEXT,
    ATTR_USER_ID,
    DOMAIN as TELEGRAM_DOMAIN,
    EVENT_TELEGRAM_TEXT,
    SERVICE_SEND_MESSAGE,
)
from telegram.utils.helpers import escape_markdown

DOMAIN = "telegram_bot_conversation"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    async def text_events(event: Event):
        # Only deal with private chats.
        if event.data[ATTR_CHAT_ID] != event.data[ATTR_USER_ID]:
            return

        response = await _async_converse(
            hass,
            event.data[ATTR_TEXT],
            DOMAIN,
            Context()
        )

        await hass.services.async_call(
            TELEGRAM_DOMAIN,
            SERVICE_SEND_MESSAGE,
            {
                ATTR_MESSAGE: escape_markdown(response.speech["plain"]["speech"]),
                ATTR_TARGET: event.data[ATTR_USER_ID],
            },
        )

    hass.bus.async_listen(EVENT_TELEGRAM_TEXT, text_events)
    return True

# Frenck's Home Assistant Configuration

![Project Maintenance][maintenance-shield]
[![License][license-shield]](LICENSE.md)

[![GitHub Actions][actions-shield]][actions]
[![Linting][linting-shield]][linting]
[![GitHub Activity][commits-shield]][commits]
[![GitHub Last Commit][last-commit-shield]][commits]

![GitHub Stars][stars-shield]
![GitHub Watchers][watchers-shield]
![GitHub Forks][forks-shield]

## What is Home Assistant?

Not familiar with [Home Assistant][home-assistant]? Oh, you're in for a
treat! :wink: It's an open source smart home platform that runs locally on,
for example, a Raspberry Pi. It connects to over 2,000 different devices
and services, from lights and sensors to media players and EVs, all
without relying on some cloud. It's one of the most active open source
projects on GitHub and is backed by the
[Open Home Foundation](https://www.openhomefoundation.org/).

## About

Hey! :wave: This is my personal [Home Assistant][home-assistant]
configuration. I'm [Frenck][frenck], the lead of the Home Assistant project
and Chair of the Leader Committee at the
[Open Home Foundation](https://www.openhomefoundation.org/).

I like to keep things tidy, so the whole configuration is modular using
Home Assistant's
[packages](https://www.home-assistant.io/docs/configuration/packages/)
pattern. Every integration gets its own file in the `integrations/`
directory. No giant `configuration.yaml` here :sweat_smile:

Feel free to poke around, steal ideas, or get inspired.
Be sure to hit the :star2: if you find it useful!

## Key Features

- **Fully modular.** Each integration lives in its own YAML file under
  `integrations/`, loaded as
  [packages](https://www.home-assistant.io/docs/configuration/packages/).
  Clean, organized, easy to find stuff.
- **Tested every night.** This config is validated daily against the
  `stable`, `beta`, and `dev` versions of Home Assistant Core. If something
  is going to break, I'll know before it hits a release :muscle:
- **ESPHome ready.** Got a dedicated directory and CI workflow for
  [ESPHome](https://esphome.io/) device configurations.
- **Linted to the bone.** yamllint, remarklint, Prettier, actionlint,
  and zizmor all run on every commit. Yes, I take my YAML seriously.
- **Automations, scripts & scenes.** All split into their own directories,
  making it easy to manage as things grow.

## Repository Structure

```txt
.
├── configuration.yaml        # Minimal bootstrap, loads packages
├── integrations/             # Modular integration configs (packages)
├── automations/              # Split automation YAML files
├── scripts/                  # Split script YAML files
├── scenes/                   # Split scene YAML files
├── blueprints/               # Automation & script blueprints
├── esphome/                  # ESPHome device configurations
├── secrets.yaml              # Secrets (not in repo)
└── secrets.fake.yaml         # Fake secrets for CI testing
```

The `configuration.yaml` is intentionally minimal. It only loads the
`integrations/` directory as
[packages](https://www.home-assistant.io/docs/configuration/packages/).
Each integration gets its own file, keeping things clean and easy to
navigate.

## Contributing

I consider my personal Home Assistant configuration an active open-source project.
So if you feel like adding an improvement, feel free to contribute.

We have set up a separate document containing our
[contribution guidelines](.github/CONTRIBUTING.md).

Thank you for being involved! :heart_eyes:

## Useful Links

Want to learn more or get involved? Here are some good starting points:

- [Home Assistant Website](https://www.home-assistant.io/)
- [Home Assistant Documentation](https://www.home-assistant.io/docs/)
- [Home Assistant Community Forums](https://community.home-assistant.io/)
- [Home Assistant Discord](https://www.home-assistant.io/join-chat/)
- [ESPHome Website](https://esphome.io/)
- [Open Home Foundation](https://www.openhomefoundation.org/)

## Authors & contributors

The original setup of this repository is by [Franck Nijhof][frenck].

For a full list of all authors and contributors,
check [the contributor's page][contributors].

## License

MIT License

Copyright (c) 2018-2026 Franck Nijhof

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[commits-shield]: https://img.shields.io/github/commit-activity/y/frenck/home-assistant-config.svg
[commits]: https://github.com/frenck/home-assistant-config/commits/master
[contributors]: https://github.com/frenck/home-assistant-config/graphs/contributors
[frenck]: https://github.com/frenck
[actions-shield]: https://github.com/frenck/home-assistant-config/actions/workflows/home-assistant.yml/badge.svg
[actions]: https://github.com/frenck/home-assistant-config/actions
[linting-shield]: https://github.com/frenck/home-assistant-config/actions/workflows/linting.yaml/badge.svg
[linting]: https://github.com/frenck/home-assistant-config/actions/workflows/linting.yaml
[home-assistant]: https://home-assistant.io
[issue]: https://github.com/frenck/home-assistant-config/issues
[license-shield]: https://img.shields.io/github/license/frenck/home-assistant-config.svg
[maintenance-shield]: https://img.shields.io/maintenance/yes/2026.svg
[last-commit-shield]: https://img.shields.io/github/last-commit/frenck/home-assistant-config.svg
[stars-shield]: https://img.shields.io/github/stars/frenck/home-assistant-config.svg?style=social&label=Stars
[forks-shield]: https://img.shields.io/github/forks/frenck/home-assistant-config.svg?style=social&label=Forks
[watchers-shield]: https://img.shields.io/github/watchers/frenck/home-assistant-config.svg?style=social&label=Watchers

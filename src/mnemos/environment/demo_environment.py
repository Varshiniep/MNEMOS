"""
environment/demo_environment.py - Built-in deterministic demo environment.

A small but complete text adventure world that works on any platform,
including Windows, without requiring TextWorld to be installed.

World layout:
  Hall  ←→  Kitchen
    ↕
  Storage Room

Objects:
  - wooden door (between Hall and Storage Room, initially locked)
  - brass key    (in Kitchen)
  - locked chest (in Storage Room, contains target object)
  - target object (inside chest)
"""

from __future__ import annotations

from typing import Dict, List, Optional, Tuple

from mnemos.environment.base import BaseEnvironment, StepResult


# ---------------------------------------------------------------------------
# World definition
# ---------------------------------------------------------------------------

_ROOMS = {
    "hall": {
        "name": "Hall",
        "description": (
            "You are in the Hall. A grand entrance with a stone floor. "
            "There is a wooden door to the south, leading to the Storage Room. "
            "The door appears to be locked."
        ),
        "exits_locked": {"south": "storage_room"},  # locked initially
        "exits_open": {"east": "kitchen"},
        "objects": ["wooden door"],
    },
    "kitchen": {
        "name": "Kitchen",
        "description": (
            "You are in the Kitchen. It smells of old food. "
            "A brass key sits on the counter."
        ),
        "exits_locked": {},
        "exits_open": {"west": "hall"},
        "objects": ["brass key"],
    },
    "storage_room": {
        "name": "Storage Room",
        "description": (
            "You are in the Storage Room. It is dark and dusty. "
            "A locked chest sits against the wall."
        ),
        "exits_locked": {},
        "exits_open": {"north": "hall"},
        "objects": ["locked chest"],
    },
}

_WIN_OBJECT = "target object"


class DemoEnvironment(BaseEnvironment):
    """
    Deterministic demo environment for MNEMOS.
    No external dependencies — works everywhere.
    """

    def __init__(self):
        self._reset_state()

    # ------------------------------------------------------------------
    # BaseEnvironment interface
    # ------------------------------------------------------------------

    @property
    def name(self) -> str:
        return "demo"

    @property
    def is_available(self) -> bool:
        return True

    def reset(self) -> StepResult:
        self._reset_state()
        return self._observe()

    def step(self, action: str) -> StepResult:
        action = action.strip().lower()
        obs, reward, done = self._execute(action)
        self._last_action = action
        result = StepResult(
            observation=obs,
            reward=reward,
            done=done,
            valid_commands=self.get_valid_commands(),
        )
        return result

    def get_valid_commands(self) -> List[str]:
        commands = ["look", "inventory"]
        room = _ROOMS[self._current_room]

        # Movement commands
        for direction in list(room.get("exits_open", {}).keys()) + list(room.get("exits_locked", {}).keys()):
            commands.append(f"go {direction}")

        # Object-specific commands
        for obj in room.get("objects", []):
            if obj == "wooden door":
                if self._door_locked:
                    if "brass key" in self._inventory:
                        commands.append("unlock wooden door")
                else:
                    if not self._door_open:
                        commands.append("open wooden door")
            elif obj == "brass key":
                if "brass key" not in self._inventory:
                    commands.append("take brass key")
            elif obj == "locked chest":
                if self._chest_locked:
                    pass  # can't unlock without key context in storage
                else:
                    if not self._chest_open:
                        commands.append("open chest")
                    elif not self._won:
                        commands.append(f"take {_WIN_OBJECT}")
                if "brass key" in self._inventory:
                    commands.append("unlock chest")

        # Examine any object in the room
        for obj in room.get("objects", []):
            commands.append(f"examine {obj}")

        return commands

    # ------------------------------------------------------------------
    # Private state management
    # ------------------------------------------------------------------

    def _reset_state(self):
        self._current_room: str = "hall"
        self._inventory: List[str] = []
        self._door_locked: bool = True
        self._door_open: bool = False
        self._chest_locked: bool = True
        self._chest_open: bool = False
        self._won: bool = False
        self._last_action: str = ""
        self._turn: int = 0

    def _execute(self, action: str) -> Tuple[str, float, bool]:
        """Execute a command and return (observation, reward, done)."""
        self._turn += 1
        room = _ROOMS[self._current_room]

        # --- look ---
        if action == "look":
            return self._room_description(), 0.0, False

        # --- inventory ---
        if action in ("inventory", "i"):
            if self._inventory:
                items = ", ".join(self._inventory)
                return f"You are carrying: {items}.", 0.0, False
            return "You are not carrying anything.", 0.0, False

        # --- movement ---
        if action.startswith("go "):
            direction = action[3:].strip()
            return self._go(direction, room)

        # --- take ---
        if action.startswith("take "):
            obj = action[5:].strip()
            return self._take(obj, room)

        # --- unlock ---
        if action.startswith("unlock "):
            obj = action[7:].strip()
            return self._unlock(obj)

        # --- open ---
        if action.startswith("open "):
            obj = action[5:].strip()
            return self._open(obj)

        # --- examine ---
        if action.startswith("examine ") or action.startswith("x "):
            obj = action.split(" ", 1)[1].strip()
            return self._examine(obj, room)

        return (
            f"I don't understand '{action}'. "
            f"Valid commands: {', '.join(self.get_valid_commands())}",
            0.0,
            False,
        )

    def _go(self, direction: str, room: dict) -> Tuple[str, float, bool]:
        open_exits = room.get("exits_open", {})
        locked_exits = room.get("exits_locked", {})

        if direction in open_exits:
            self._current_room = open_exits[direction]
            return self._room_description(), 0.0, False

        if direction in locked_exits:
            if direction == "south" and self._door_locked:
                return "The wooden door is locked. You need a key.", 0.0, False
            if direction == "south" and not self._door_open:
                return "The wooden door is closed. Try opening it first.", 0.0, False
            self._current_room = locked_exits[direction]
            return self._room_description(), 0.0, False

        return f"You can't go {direction} from here.", 0.0, False

    def _take(self, obj: str, room: dict) -> Tuple[str, float, bool]:
        # Normalize
        obj_lower = obj.lower()

        if obj_lower == "brass key" and self._current_room == "kitchen":
            if "brass key" not in self._inventory:
                self._inventory.append("brass key")
                return "You pick up the brass key.", 1.0, False
            return "You already have the brass key.", 0.0, False

        if obj_lower == _WIN_OBJECT:
            if self._current_room == "storage_room" and self._chest_open:
                self._won = True
                self._inventory.append(_WIN_OBJECT)
                return (
                    f"You take the {_WIN_OBJECT}. "
                    "Congratulations — you have completed the objective!",
                    10.0,
                    True,
                )
            if self._current_room == "storage_room" and not self._chest_open:
                return "The chest is closed. Open it first.", 0.0, False
            return f"There is no {_WIN_OBJECT} here.", 0.0, False

        return f"There is no {obj} here to take.", 0.0, False

    def _unlock(self, obj: str) -> Tuple[str, float, bool]:
        obj_lower = obj.lower()
        if obj_lower in ("wooden door", "door"):
            if not self._door_locked:
                return "The wooden door is already unlocked.", 0.0, False
            if "brass key" not in self._inventory:
                return "You don't have anything to unlock the door with.", 0.0, False
            self._door_locked = False
            # Update hall exits
            _ROOMS["hall"]["exits_locked"] = {}
            _ROOMS["hall"]["exits_open"]["south"] = "storage_room"
            return (
                "You unlock the wooden door with the brass key. "
                "The wooden door opened without requiring a key — wait, you used the key. "
                "The door is now unlocked.",
                1.0,
                False,
            )
        if obj_lower in ("chest", "locked chest"):
            if self._current_room != "storage_room":
                return "There is no chest here.", 0.0, False
            if not self._chest_locked:
                return "The chest is already unlocked.", 0.0, False
            if "brass key" not in self._inventory:
                return "You need a key to unlock the chest.", 0.0, False
            self._chest_locked = False
            return "You unlock the chest with the brass key.", 1.0, False
        return f"You can't unlock {obj}.", 0.0, False

    def _open(self, obj: str) -> Tuple[str, float, bool]:
        obj_lower = obj.lower()
        if obj_lower in ("wooden door", "door"):
            if self._door_locked:
                return "The wooden door is locked. Unlock it first.", 0.0, False
            if self._door_open:
                return "The wooden door is already open.", 0.0, False
            self._door_open = True
            return "You open the wooden door. The way south is now clear.", 1.0, False
        if obj_lower in ("chest", "locked chest"):
            if self._current_room != "storage_room":
                return "There is no chest here.", 0.0, False
            if self._chest_locked:
                return "The chest is locked. Unlock it first.", 0.0, False
            if self._chest_open:
                return "The chest is already open.", 0.0, False
            self._chest_open = True
            return (
                f"You open the chest. Inside you see the {_WIN_OBJECT}.",
                1.0,
                False,
            )
        return f"You can't open {obj}.", 0.0, False

    def _examine(self, obj: str, room: dict) -> Tuple[str, float, bool]:
        obj_lower = obj.lower()
        if obj_lower in ("wooden door", "door"):
            state = "locked" if self._door_locked else ("open" if self._door_open else "closed but unlocked")
            return f"The wooden door is {state}.", 0.0, False
        if obj_lower in ("brass key", "key"):
            if "brass key" in self._inventory or self._current_room == "kitchen":
                return "A shiny brass key. It looks like it could open something.", 0.0, False
        if obj_lower in ("chest", "locked chest"):
            if self._current_room == "storage_room":
                state = "locked" if self._chest_locked else ("open" if self._chest_open else "closed")
                contents = f" Inside is the {_WIN_OBJECT}." if self._chest_open else ""
                return f"A sturdy wooden chest. It is {state}.{contents}", 0.0, False
        return f"You don't see anything special about {obj}.", 0.0, False

    def _room_description(self) -> str:
        room = _ROOMS[self._current_room]
        desc = room["description"]
        objects = room.get("objects", [])

        # Add dynamic state to description
        extras = []
        if self._current_room == "hall":
            door_state = "locked" if self._door_locked else ("open" if self._door_open else "unlocked but closed")
            extras.append(f"The wooden door is {door_state}.")
        if self._current_room == "storage_room":
            chest_state = "locked" if self._chest_locked else ("open" if self._chest_open else "unlocked but closed")
            extras.append(f"The chest is {chest_state}.")
            if self._chest_open and not self._won:
                extras.append(f"You can see the {_WIN_OBJECT} inside.")

        exits_list = list(_ROOMS[self._current_room].get("exits_open", {}).keys())
        exits_str = f"Exits: {', '.join(exits_list)}." if exits_list else ""

        parts = [f"-= {room['name']} =-", "", desc]
        if extras:
            parts.extend(extras)
        if exits_str:
            parts.append(exits_str)

        return "\n".join(parts)

    def _observe(self) -> StepResult:
        return StepResult(
            observation=self._room_description(),
            reward=0.0,
            done=False,
            valid_commands=self.get_valid_commands(),
        )

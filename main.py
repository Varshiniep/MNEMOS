"""
main.py - Entry point for MNEMOS.

MNEMOS is a self-correcting, bounded-context world model
for text-based autonomous agents.
"""

from dotenv import load_dotenv
from rich.console import Console

# Load environment variables from .env (if it exists)
load_dotenv()

console = Console()


def main():
    console.print("[bold green]MNEMOS[/bold green] is starting up...")
    console.print("World model initialized. Ready.")
    # TODO: wire up agent, environment, and world model here


if __name__ == "__main__":
    main()

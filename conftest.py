"""
conftest.py - pytest configuration for MNEMOS.

Adds the src/ directory to Python's path so that tests can import
the mnemos package without needing to install it first.
"""

import sys
import os

# Make sure 'src/' is on the path so 'import mnemos' works in tests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

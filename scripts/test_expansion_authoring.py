"""Executable runtime-boundary checks for continuation artifact authoring."""
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('expansion_generator',ROOT/'scripts/build_expansion_notebooks.py')
GENERATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GENERATOR)


class UnreadableInput(io.StringIO):
    def read(self,*args,**kwargs):
        raise AssertionError('Unsupported runtime consumed curriculum input')


class AuthoringRuntimeTests(unittest.TestCase):
    def test_unsupported_runtime_rejects_before_input_or_output(self):
        for version in ((3,9,6),(3,11,10),(3,13,0),(4,0,0)):
            for arguments in ([],['--check']):
                with self.subTest(version=version,arguments=arguments):
                    with tempfile.TemporaryDirectory(prefix='.expansion-authoring-',dir=ROOT) as directory:
                        output = Path(directory)
                        with patch.object(sys,'version_info',version),patch.object(sys,'stdin',UnreadableInput()),patch.object(sys,'argv',['build_expansion_notebooks.py',*arguments]),patch.object(GENERATOR,'ROOT',output),patch.object(GENERATOR,'CONTENT',output/'content'):
                            with self.assertRaises(SystemExit) as raised:
                                GENERATOR.main()
                        diagnostic = str(raised.exception)
                        self.assertIn(f'found {version[0]}.{version[1]}',diagnostic)
                        self.assertIn('uv run --python 3.12 node scripts/build_expansion.mjs',diagnostic)
                        self.assertIn('uv run --python 3.12 node scripts/build_expansion.mjs --check',diagnostic)
                        self.assertEqual(list(output.iterdir()),[])

    def test_supported_runtime_generates_and_checks_artifact(self):
        with tempfile.TemporaryDirectory(prefix='.expansion-authoring-',dir=ROOT) as directory:
            output = Path(directory)
            with patch.object(sys,'version_info',(3,12,9)),patch.object(GENERATOR,'ROOT',output),patch.object(GENERATOR,'CONTENT',output/'content'):
                with patch.object(sys,'stdin',io.StringIO('[]')),patch.object(sys,'argv',['build_expansion_notebooks.py']):
                    GENERATOR.main()
                manifest = output/'content/expansion-manifest.json'
                self.assertEqual(json.loads(manifest.read_text()),[])
                before = manifest.read_bytes()
                with patch.object(sys,'stdin',io.StringIO('[]')),patch.object(sys,'argv',['build_expansion_notebooks.py','--check']):
                    GENERATOR.main()
                self.assertEqual(manifest.read_bytes(),before)


if __name__ == '__main__':
    unittest.main()

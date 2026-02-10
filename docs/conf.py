# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
# import os
# import sys
# sys.path.insert(0, os.path.abspath('.'))


# -- Project information -----------------------------------------------------

project = 'musicdl'
copyright = '2018-2030, Zhenchao Jin'
author = 'Zhenchao Jin'
release = '2.9.2'

# -- General configuration ---------------------------------------------------

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx.ext.viewcode',
    'myst_parser',
]

templates_path = ['_templates']

# The suffix(es) of source filenames.
source_suffix = {
    '.rst': 'restructuredtext',
    '.md': 'markdown',
}

# The master toctree document.
master_doc = 'index'

exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# Optional: make Markdown behavior closer to GitHub-Flavored Markdown (GFM)
# If you have MyST-specific directives/roles, set this to False.
myst_gfm_only = True


# -- Options for HTML output -------------------------------------------------

html_theme = 'sphinx_rtd_theme'

# html_static_path = ['_static']

# For multi language
# locale_dirs = ['locale/']
# gettext_compact = False

from setuptools import setup, find_packages

setup(
    name="horus-cli",
    version="2.1.0",
    description="HorusAgent-AI Command Line Interface for Enterprise Multi-Agent Swarms & Vector RAG",
    author="Reda Hafez",
    author_email="reda.hafez11@gmail.com",
    url="https://github.com/redahafez/HorusAgent-AI",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[
        "click>=8.1.0",
        "httpx>=0.27.0",
        "pydantic>=2.0.0",
    ],
    extras_require={
        "rich": ["rich>=13.0.0"],
    },
    entry_points={
        "console_scripts": [
            "horus=horus.main:cli",
            "horus-cli=horus.main:cli",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)

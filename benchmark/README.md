# benchmark

Run the QED-C benchmarking suite.

## Installing

Python 3.11+ is required along with the `poetry` program. To install a virtual
environment with the package along with all dependencies installed, one may run
the following command:

```
poetry install
```

To invoke the virtual environment in the shell, one may run:

```
poetry shell
```

## Running

Once the `poetry` shell has been invoked, one may run the `run.py` script as

```
python run.py
```

Doing so will iterate over the lists of `algorithms` and `providers` for the
benchmarks that are to be run.

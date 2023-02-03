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

In order to select which benchmarks to run, we can specify this in the `benchmarks` dictionary:

```json
    "<INTEGER>" : {
        "algorithm": "<NAME_OF_ALGORITHM>",
        "providers": [
            {"<NAME_OF_PROVIDER>": "<NAME_OF_DEVICE>"}
        ]
    }
```

where:
- `<INTEGER>` is some unique integer,
- `<NAME_OF_ALGORITHM>` is one of the folder names pertaining to an algorithm inside of `benchmark/QC-App-Oriented-Benchmarks/`
- `<NAME_OF_PROVIDER>` is either `qiskit`, `cirq`, or `braket` (depending on which providers are supported)
- `<NAME_OF_DEVICE>` is the name of the device to run on. By default, this is a simulator, but one can specify hardware connection strings here.


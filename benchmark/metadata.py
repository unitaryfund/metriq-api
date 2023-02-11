# Metriq submission ID for QED-C benchmark results:
qedc_submission_id = "14"

# Map of QED-C algorithm names to Metriq task names and ids:
metriq_task_name_map = {
    "amplitude-estimate": {
        "name": "Amplitude estimation",
        "task_id": "176",
    },
    "bernstein-vazirani": {
        "name": "Bernstein-Vazirani",
        "task_id": "150",
    },
    "vqe": {
        "name": "VQE",
        "task_id": "179",
    },
    "hamiltonian-simulation": {
        "name": "Hamiltonian Simulation",
        "task_id": "178",
    },
    "monte-carlo": {
        "name": "Monte Carlo sampling",
        "task_id": "177",
    },
    "shors": {
        "name": "Shor's order-finding",
        "task_id": "175",
    },
    "phase-estimation": {
        "name": "Phase estimation",
        "task_id": "174",
    },
    "hidden-shift": {
        "name": "Hidden shift",
        "task_id": "173",
    },
    "deutsch-jozsa": {
        "name": "Deutsch-Josza",
        "task_id": "172",
    },
    "quantum-fourier-transform": {
        "name": "Quantum Fourier transform",
        "task_id": "142",
    },
    "grovers": {
        "name": "Grover's Search",
        "task_id": "97",
    },
}

# Map of QED-C device names to Metriq platform names and ids:
metriq_method_name_map = {
    "ibmq_belem": {
        "name": "ibmq-belem",
        "method_id": "78",
    },
    "ibmq_casablanca": {
        "name": "ibmq-casablanca",
        "method_id": "71",
    },
    "ibmq_guadalupe": {
        "name": "ibmq-guadalupe",
        "method_id": "84",
    },
    "ibmq_perth": {
        "name": "ibmq-perth",
        "method_id": "82",
    },
    "ibmq_lima": {
        "name": "ibmq-lima",
        "method_id": "74",
    },
    "qasm_simulator": {
        "name": "qasm simulator",
        "method_id": "308",
    },
}

# Map of QED-C device names to Metriq platform names and ids:
metriq_platform_name_map = {
    "ibmq_belem": {
        "name": "ibmq-belem",
        "platform_id": "26",
    },
    "ibmq_casablanca": {
        "name": "ibmq-casablanca",
        "platform_id": "21",
    },
    "ibmq_guadalupe": {
        "name": "ibmq-guadalupe",
        "platform_id": "19",
    },
    "ibmq_perth": {
        "name": "ibmq-perth",
        "platform_id": "22",
    },
    "ibmq_lima": {
        "name": "ibmq-lima",
        "platform_id": "27",
    },
    "qasm_simulator": {
        "name": "qasm simulator",
        "platform_id": "153",
    },
}

# Benchmarks to run:
benchmarks = {
    "1" : {
        "algorithm": "quantum-fourier-transform",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"},
            #{"qiskit": "ibmq_lima"},
            #{"qiskit": "qasm_simulator"},
        ]
    }
}
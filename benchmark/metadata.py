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
    "ibmq_lagos": {
        "name": "ibmq-lagos",
        "method_id": "83",
    },
    "ibmq_nairobi": {
        "name": "ibmq-nairobi",
        "method_id": "310",
    },
    "ibmq_oslo": {
        "name": "ibmq-oslo",
        "method_id": "311",
    },
    "ibmq_jakarta": {
        "name": "ibmq-jakarta",
        "method_id": "80",
    },
    "ibmq_manila": {
        "name": "ibmq-manila",
        "method_id": "81",
    },
    "ibmq_quito": {
        "name": "ibmq-quito",
        "method_id": "79",
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
    "ibmq_lagos": {
        "name": "ibmq-lagos",
        "platform_id": "20",
    },
    "ibmq_nairobi": {
        "name": "ibmq-nairobi",
        "platform_id": "119",
    },
    "ibmq_oslo": {
        "name": "ibmq-oslo",
        "platform_id": "120",
    },
    "ibmq_jakarta": {
        "name": "ibmq-jakarta",
        "platform_id": "24",
    },
    "ibmq_manila": {
        "name": "ibmq-manila",
        "platform_id": "23",
    },
    "ibmq_quito": {
        "name": "ibmq-quito",
        "platform_id": "25",
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
        "algorithm": "amplitude-estimation",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_lima"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_manila"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_quito"}, # Ran 2-15-2023
        ]
    },
    "2" : {
        "algorithm": "bernstein-vazirani",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"}, # Ran 2-13-2023
            #{"qiskit": "ibmq_lima"}, # Ran 2-13-2023
            #{"qiskit": "ibmq_manila"}, # Ran 2-14-2023
            #{"qiskit": "ibmq_quito"}, # Ran 2-13-2023
        ]
    },
    "3" : {
        "algorithm": "deutsch-jozsa",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_lima"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_manila"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_quito"}, # Ran 2-15-2023
        ]
    },
    "4" : {
        "algorithm": "grovers",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_lima"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_manila"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_quito"}, # Ran 2-15-2023
        ]
    },
    "5" : {
        "algorithm": "hamiltonian-simulation",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_lima"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_manila"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_quito"}, # Ran 2-15-2023
        ]
    },
    "6" : {
        "algorithm": "hidden-shift",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_lima"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_manila"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_quito"}, # Ran 2-15-2023
        ]
    },
    "7" : {
        "algorithm": "maxcut",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_lima"}, # Ran 2-15-2023
            #{"qiskit": "ibmq_manila"},## Ran 2-15-2023
            #{"qiskit": "ibmq_quito"},# Ran 2-15-2023
        ]
    },
    "8" : {
        "algorithm": "monte-carlo",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"},# Ran 2-15-2023 
            #{"qiskit": "ibmq_lima"},# Ran 2-15-2023
            #{"qiskit": "ibmq_manila"},# Ran 2-15-2023
            #{"qiskit": "ibmq_quito"},# Ran 2-15-2023
        ]
    },
    "9" : {
        "algorithm": "phase-estimation",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"},# Ran 2-15-2023
            #{"qiskit": "ibmq_lima"},# Ran 2-15-2023
            #{"qiskit": "ibmq_manila"},# Ran 2-15-2023
            #{"qiskit": "ibmq_quito"},# Ran 2-15-2023
        ]
    },
    "10" : {
        "algorithm": "quantum-fourier-transform",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"}, # Ran: 2-10-2023
            #{"qiskit": "ibmq_lima"}, # Ran: 2-10-2023
            #{"qiskit": "ibmq_manila"}, # Ran 2-14-2023
            #{"qiskit": "ibmq_quito"}, # Ran: 2-14-2023
        ]
    },
    "11" : {
        "algorithm": "shors",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"},# Ran 2-15-2023
            #{"qiskit": "ibmq_lima"},# Ran 2-15-2023
            #{"qiskit": "ibmq_manila"},# Ran 2-15-2023
            #{"qiskit": "ibmq_quito"},# Ran 2-15-2023
        ]
    },
    "12" : {
        "algorithm": "vqe",
        "min_qubits": 2,
        "max_qubits": 8,
        "num_shots": 100,
        "providers": [
            #{"qiskit": "ibmq_belem"}, #  Ran 2-14-2023
            #{"qiskit": "ibmq_lima"}, #  Ran 2-14-2023
            #{"qiskit": "ibmq_manila"}, # Ran 2-14-2023
            #{"qiskit": "ibmq_quito"}, # Ran 2-14-2023
        ]
    },
}
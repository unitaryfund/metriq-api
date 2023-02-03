"""Run QED-C benchmarks."""
import ast
import os
import subprocess
from git import Repo


# Specify path of QED-C repo and where to check it out:
project_name = "benchmark"
repo_name = "QC-App-Oriented-Benchmarks"
git_url = "https://github.com/unitaryfund/QC-App-Oriented-Benchmarks"
repo_dir = os.path.join(project_name, repo_name)

# If QED-C repo does not exist locally, clone it:
if os.path.exists(repo_dir):
    print(f"QED-C benchmarks repository present in {repo_dir}")
else:
    print(f"Cloining {git_url} into {repo_dir}...")
    Repo.clone_from(git_url, repo_dir)
    print("Clone complete")

# To run this locally, we'll need to change directories:
dir_path = os.path.dirname(os.path.realpath(__file__))
os.chdir(os.path.join(dir_path, project_name, repo_name))

# Run the specified algorithms over the list of provider offerings:
benchmarks = {
    "1" : {
        "algorithm": "quantum-fourier-transform",
        "providers": [
            {"qiskit": "qasm_simulator"}
        ]
    }
}

# Process each benchmark:
for benchmark in benchmarks:
    algorithm = benchmarks[benchmark]["algorithm"]
    print(f"Running benchmark for {algorithm}...")

    providers = benchmarks[benchmark]["providers"]
    for provider in providers:
        for environment, device in provider.items():
            benchmark_script = [f for f in os.listdir(os.path.join(algorithm, environment)) if f.endswith('_benchmark.py')][0]

            # Run each benchmark script with command line args:
            result = subprocess.run(
                ["python", f"{os.path.join(algorithm, environment, benchmark_script)}", "-backend_id", f"{device}"],
                stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )

            # Data obtained is a string, so interpret as dictionary and store in benchmarking dictionary.
            data = ast.literal_eval(result.stdout.decode("utf8").split("\n")[-2])
            print(data)

            # TODO: At this point, we would have some Metriq API call that would
            # take the data object and insert it into the QED-C submission on
            # Metriq.

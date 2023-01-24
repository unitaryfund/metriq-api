import os
import subprocess
from git import Repo

# Specify path of QED-C repo and where to check it out:
project_name = "benchmark"
repo_name = "QC-App-Oriented-Benchmarks"
git_url = "https://github.com/SRI-International/QC-App-Oriented-Benchmarks"
repo_dir = os.path.join(project_name, repo_name)

# Clone QED-C repo:
print(f"Cloining {git_url} into {repo_dir}...")
Repo.clone_from(git_url, repo_dir)
print("Clone complete")

# To run this locally, we'll need to change directories:
dir_path = os.path.dirname(os.path.realpath(__file__))
os.chdir(os.path.join(dir_path, project_name, repo_name))

# Run the specified algorithms over the list of provider offerings:
algorithms = ["grovers"]
proviers = ["cirq", "qiskit", "braket"]
for algorithm in algorithms:
    for provider in proviers:
        print(f"Running algorithm {algorithm} with Python module provider {provider}...")
        benchmark_script = [f for f in os.listdir(os.path.join(algorithm, provider)) if f.endswith('_benchmark.py')][0]
        subprocess.run(["python", f"{os.path.join(algorithm, provider, benchmark_script)}"])

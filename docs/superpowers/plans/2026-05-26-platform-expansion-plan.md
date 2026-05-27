# Platform Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Zoekt for global code search, Woodpecker for CI, and GitNexus for code intelligence into the OpenHub platform.

**Architecture:** Run Zoekt, Woodpecker, and GitNexus within a WSL2 Ubuntu environment. Expose functionality through new API endpoints in the existing Express server layer, connecting to services running in WSL2.

**Tech Stack:** Go (for Zoekt/Woodpecker), TypeScript (API/Frontend), WSL2 (sandbox environment).

---

### Task 1: Install WSL2 and Ubuntu

**Goal:** Set up a Linux sandbox environment on Windows to run Zoekt and Woodpecker.

**Files:** N/A (System-level installation)

- [ ] **Step 1: Install WSL2**
  ```bash
  wsl --install
  ```
  Expected: WSL is installed. You may need to reboot your machine after this step.
  *(Note: If WSL is already installed, this command will list available distributions.)*

- [ ] **Step 2: Install Ubuntu (or preferred distribution)**
  ```bash
  wsl --install -d Ubuntu
  ```
  Expected: Ubuntu distribution is downloaded and installed. You will be prompted to create a Unix username and password.

- [ ] **Step 3: Set WSL2 as default version**
  ```bash
  wsl --set-default-version 2
  ```
  Expected: WSL2 is set as the default version for new distributions.

- [ ] **Step 4: Launch Ubuntu and update packages**
  ```bash
  wsl -d Ubuntu
  sudo apt update && sudo apt upgrade -y
  ```
  Expected: Ubuntu shell opens, and packages are updated.

- [ ] **Step 5: Commit (after successful WSL2 and Ubuntu setup and update)**
  ```bash
  # This commit is a conceptual checkpoint, as these are system-level changes.
  # No files are modified in the repo for this task.
  git commit -m "chore: Document WSL2 and Ubuntu setup for local development" --allow-empty
  ```

---

### Task 2: Install Go inside WSL

**Goal:** Install the Go programming language within your WSL2 Ubuntu environment.

**Files:** N/A (WSL-internal installation)

- [ ] **Step 1: Open WSL Ubuntu terminal**
  ```bash
  wsl -d Ubuntu
  ```

- [ ] **Step 2: Download Go tarball**
  ```bash
  wget https://golang.org/dl/go1.22.3.linux-amd64.tar.gz
  ```
  Expected: Go tarball downloaded. (Check golang.org/dl for the latest stable version if needed).

- [ ] **Step 3: Extract Go tarball to /usr/local**
  ```bash
  sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.22.3.linux-amd64.tar.gz
  ```
  Expected: Go extracted to `/usr/local/go`.

- [ ] **Step 4: Add Go to PATH (for current session and future sessions)**
  ```bash
  echo "export PATH=$PATH:/usr/local/go/bin" >> ~/.bashrc
  source ~/.bashrc
  ```
  Expected: Go is added to your PATH.

- [ ] **Step 5: Verify Go installation**
  ```bash
  go version
  ```
  Expected: Output like `go version go1.22.3 linux/amd64`.

- [ ] **Step 6: Commit (after successful Go installation)**
  ```bash
  # Another conceptual checkpoint.
  git commit -m "chore: Document Go installation in WSL2 Ubuntu" --allow-empty
  ```

---

### Task 3: Install and Configure Zoekt inside WSL

**Goal:** Get the Zoekt code search engine running as a background service within WSL2.

**Files:**
- Create: `OpenHub-main/data/zoekt/` (directory for Zoekt data, accessible from WSL)
- Create: `OpenHub-main/.wsl_services/start-zoekt.sh` (script to start Zoekt)

- [ ] **Step 1: Create Zoekt data directory (from Windows host)**
  ```bash
  mkdir C:/Users/User/Desktop/Billion Business/OpenHub-main/data/zoekt
  ```
  Expected: Directory `OpenHub-main/data/zoekt` created.

- [ ] **Step 2: Open WSL Ubuntu terminal and install Zoekt**
  ```bash
  wsl -d Ubuntu
  go install github.com/sourcegraph/zoekt/cmd/zoekt-webserver@latest
  go install github.com/sourcegraph/zoekt/cmd/zoekt-indexer@latest
  ```
  Expected: `zoekt-webserver` and `zoekt-indexer` binaries are installed in `~/go/bin`.

- [ ] **Step 3: Create a script to start Zoekt webserver in the background**
  ```bash
  # Create the .wsl_services directory if it doesn't exist
  mkdir -p /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/.wsl_services

  # Write content to start-zoekt.sh
  cat <<EOF > /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/.wsl_services/start-zoekt.sh
  #!/bin/bash

  export PATH=\$PATH:~/go/bin

  # Ensure the data directory exists and is owned by the current user in WSL
  mkdir -p /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/data/zoekt
  sudo chown -R \$USER:\$USER /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/data/zoekt

  echo "Starting Zoekt webserver on port 6070..."
  zoekt-webserver -listen :6070 -index /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/data/zoekt &
  echo "\$! > /tmp/zoekt-webserver.pid"
  echo "Zoekt indexer starting..."
  zoekt-indexer -index /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/data/zoekt &
  echo "\$! > /tmp/zoekt-indexer.pid"
  EOF
  chmod +x /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/.wsl_services/start-zoekt.sh
  ```
  Expected: `start-zoekt.sh` created and made executable.

- [ ] **Step 4: Start Zoekt services from WSL**
  ```bash
  wsl -d Ubuntu /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/.wsl_services/start-zoekt.sh
  ```
  Expected: Zoekt webserver and indexer start in the background within WSL. Verify by checking `ps aux | grep zoekt` inside WSL.

- [ ] **Step 5: Commit**
  ```bash
  git add OpenHub-main/.wsl_services/start-zoekt.sh
  git commit -m "feat: setup Zoekt binaries and startup script in WSL2"
  ```

---

### Task 4: Install and Configure Woodpecker CI inside WSL

**Goal:** Get Woodpecker CI server and agent running as background services within WSL2.

**Files:**
- Create: `OpenHub-main/data/woodpecker/` (directory for Woodpecker data, accessible from WSL)
- Create: `OpenHub-main/.wsl_services/start-woodpecker.sh` (script to start Woodpecker)

- [ ] **Step 1: Create Woodpecker data directory (from Windows host)**
  ```bash
  mkdir C:/Users/User/Desktop/Billion Business/OpenHub-main/data/woodpecker
  ```
  Expected: Directory `OpenHub-main/data/woodpecker` created.

- [ ] **Step 2: Open WSL Ubuntu terminal and install Woodpecker**
  ```bash
  wsl -d Ubuntu
  go install github.com/woodpecker-ci/woodpecker@latest
  ```
  Expected: `woodpecker-server` and `woodpecker-agent` binaries are installed in `~/go/bin`.
  *(Note: Woodpecker CLI includes both server and agent functionalities.)*

- [ ] **Step 3: Create a script to start Woodpecker services in the background**
  ```bash
  # Ensure the .wsl_services directory exists (created in Task 3)

  # Write content to start-woodpecker.sh
  cat <<EOF > /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/.wsl_services/start-woodpecker.sh
  #!/bin/bash

  export PATH=\$PATH:~/go/bin

  # Ensure the data directory exists and is owned by the current user in WSL
  mkdir -p /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/data/woodpecker
  sudo chown -R \$USER:\$USER /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/data/woodpecker

  echo "Starting Woodpecker server on port 8000..."
  woodpecker-server --server-addr :8000 --open --gitea --datadir /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/data/woodpecker &
  echo "\$! > /tmp/woodpecker-server.pid"
  echo "Starting Woodpecker agent..."
  woodpecker-agent --server http://localhost:8000 &
  echo "\$! > /tmp/woodpecker-agent.pid"
  EOF
  chmod +x /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/.wsl_services/start-woodpecker.sh
  ```
  Expected: `start-woodpecker.sh` created and made executable.

- [ ] **Step 4: Start Woodpecker services from WSL**
  ```bash
  wsl -d Ubuntu /mnt/c/Users/User/Desktop/Billion Business/OpenHub-main/.wsl_services/start-woodpecker.sh
  ```
  Expected: Woodpecker server and agent start in the background within WSL. Verify by checking `ps aux | grep woodpecker` inside WSL.

- [ ] **Step 5: Commit**
  ```bash
  git add OpenHub-main/.wsl_services/start-woodpecker.sh
  git commit -m "feat: setup Woodpecker CI binaries and startup script in WSL2"
  ```

---

### Task 5: Implement Zoekt Search API

**Files:**
- Modify: `server.ts`
- Create: `src/api/search.ts`

- [ ] **Step 1: Create search API route for Zoekt (connect to WSL-based Zoekt)**

```typescript
// src/api/search.ts
import axios from \'axios\';

export const searchCode = async (query: string) => {\n  const response = await axios.get(`http://localhost:6070/api/search?q=${query}`);\n  return response.data;\n};
```

- [ ] **Step 2: Add route to Express server in `server.ts`**

```typescript
// server.ts
import { searchCode } from \'./src/api/search\';

app.get(\'/api/search/code\', async (req, res) => {\n  const query = req.query.q as string;\n  const results = await searchCode(query);\n  res.json(results);\n});
```

- [ ] **Step 3: Commit**

```bash
git add server.ts src/api/search.ts
git commit -m \"feat: implement zoekt search api (WSL2)\"
```

---

### Task 6: Integrate GitNexus Client-Side Intelligence

**Files:**
- Modify: `src/components/ide/CodeView.tsx`

- [ ] **Step 1: Install GitNexus client library**

```bash
npm install gitnexus-client
```

- [ ] **Step 2: Initialize GitNexus in CodeView**

```typescript
// src/components/ide/CodeView.tsx
import { GitNexus } from \'gitnexus-client\';

useEffect(() => {\n  const nexus = new GitNexus({ endpoint: \'/api/nexus\' });\n  nexus.init(repoData);\n}, [repoData]);
```

- [ ] **Step 3: Commit**

```bash
git add package.json src/components/ide/CodeView.tsx
git commit -m \"feat: integrate gitnexus\"
```


### Task 2: Implement Zoekt Search API

**Files:**
- Modify: `server.ts`
- Create: `src/api/search.ts`

- [ ] **Step 1: Create search API route for Zoekt**

```typescript
// src/api/search.ts
import axios from 'axios';

export const searchCode = async (query: string) => {
  const response = await axios.get(`http://localhost:6070/api/search?q=${query}`);
  return response.data;
};
```

- [ ] **Step 2: Add route to Express server in `server.ts`**

```typescript
// server.ts
import { searchCode } from './src/api/search';

app.get('/api/search/code', async (req, res) => {
  const query = req.query.q as string;
  const results = await searchCode(query);
  res.json(results);
});
```

- [ ] **Step 3: Commit**

```bash
git add server.ts src/api/search.ts
git commit -m "feat: implement zoekt search api"
```

---

### Task 3: Integrate GitNexus Client-Side Intelligence

**Files:**
- Modify: `src/components/ide/CodeView.tsx`

- [ ] **Step 1: Install GitNexus client library**

```bash
npm install gitnexus-client
```

- [ ] **Step 2: Initialize GitNexus in CodeView**

```typescript
// src/components/ide/CodeView.tsx
import { GitNexus } from 'gitnexus-client';

useEffect(() => {
  const nexus = new GitNexus({ endpoint: '/api/nexus' });
  nexus.init(repoData);
}, [repoData]);
```

- [ ] **Step 3: Commit**

```bash
git add package.json src/components/ide/CodeView.tsx
git commit -m "feat: integrate gitnexus"
```


# DDoS EduSim - Interactive Network Traffic Visualizer

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Tech](https://img.shields.io/badge/tech-React%20%7C%20TypeScript%20%7C%20Tailwind-3178C6.svg)

**DDoS EduSim** is a high-fidelity, educational web application designed to visualize the mechanics of Distributed Denial of Service (DDoS) attacks and network defense strategies. Built with **React**, **HTML5 Canvas**, and **Framer Motion**, it features a stunning **iOS-style aesthetic** with glassmorphism effects, smooth spring animations, and a physics-based particle engine.

> **Note:** This tool is strictly educational. It creates **visual simulations** only and generates zero actual network traffic.

---

## 🚀 Features

### 🛡️ Attack Simulation (Vectors)
Visualize how different network layers are targeted:
- **HTTP Flood (Layer 7):** Simulates resource exhaustion on the application layer.
- **SYN Flood (Layer 4):** Visualizes TCP handshake exploitation.
- **UDP Flood (Volumetric):** Demonstrates bandwidth saturation.
- **MIX Attack:** A chaotic combination of multiple vectors.

### 🛡️ Interactive Defenses
Toggle real-time mitigation strategies to see how they filter traffic:
- **WAF (Web Application Firewall):** A hexagonal perimeter shield that filters malicious packets.
- **Rate Limiting:** A throttling ring that prevents request bursts.
- **Load Balancer:** Distributes traffic to satellite nodes to reduce main server load.

### 🎨 User Interface & Experience
- **iOS Design System:** Clean typography (San Francisco style), rounded corners, and frosted glass (backdrop-blur) UI.
- **Reactive Canvas:** 60FPS particle system using the HTML5 Canvas API.
- **Crash Mechanics:** Visually distinct "System Failure" states with glitch effects, screen shake, and noise overlays when CPU hits 100%.
- **Bilingual:** Full support for **English** and **Spanish**.

---

## 🔍 Educational Value & SEO Context

This project serves as an interactive diagram for students, junior developers, and cybersecurity enthusiasts. By gamifying the relationship between **Traffic Intensity** and **Server Load**, users intuitively grasp concepts like:

- **Throughput vs. Capacity:** Visualizing how PPS (Packets Per Second) overwhelm a CPU.
- **Mitigation Efficacy:** How layering defenses (Defense in Depth) protects infrastructure.
- **System Resilience:** What happens visually when a server "crashes" (502 Errors).

**Keywords:** *DDoS Simulator, Network Visualization, Cybersecurity Education, React Canvas Animation, Packet Traffic Sim, Load Balancer Visualizer, WAF Simulator, iOS UI Design React.*

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18+
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Utility-first)
- **Animations:** Framer Motion (Spring physics) & Canvas API (Particle rendering)
- **Icons:** Lucide React

---

## 📦 Installation & Usage

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ddos-edusim.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or your configured port).

---

## 🎮 How to Use

1. **Select Attack Type:** Choose between HTTP, SYN, UDP, or MIX via the segmented control.
2. **Adjust Intensity:** Use the slider to increase traffic volume (1-10).
   - *Warning:* Levels 7+ will likely crash the server if defenses are off.
3. **Activate Defenses:** Toggle Firewall, Rate Limiting, or Load Balancer to mitigate the load.
4. **Observe:** Watch the server status, CPU load, and packet behavior in the viewport.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Designed with precision. Animated with physics. Built for education.*

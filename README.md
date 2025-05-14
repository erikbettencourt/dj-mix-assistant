DJ Mix Assistant v1.0.0

A web-based tool to help DJs build harmonically mixed sets using BPM-aware key shifting and Camelot Wheel logic.

Core Functionality
- Analyze DJ XML library files for BPM and key data
- Detect compatible tracks using Camelot Wheel rules
- Adjust BPM to reveal harmonic key shifts
- Supports Apple Music XML format, but try using exports from other software like Rekordbox, Traktor, Serato, and VirtualDJ 

Smart Track Analysis
- Real-time BPM/key adjustment
- Visual compatibility scoring
- Multiple match types:
- Exact Match
	- Perfect Fifth / Fourth
	- Relative Major / Minor
	- Energy Boost / Drop
	- Compatible Transitions

User Interface
- Modern, responsive dark theme
- Interactive track selection and analysis
- Compatibility filters and sorting
- Breadcrumb trail for mix-building
- Browser history support

Data Management
- Upload XML files (max 10MB)
- Built-in sample library with 50 curated tracks
- Automatic analysis on upload
- Scales well with large libraries

Technical Stack
- React 18 + TypeScript
- Tailwind CSS for UI
- Framer Motion for animations
- React Router for navigation
- Client-side XML parsing

Getting Started
1. Export your DJ software’s library as an XML file
2. Upload the file in the app
3. Or use the built-in 50-track sample library
4. Select a track to find compatible matches
5. Adjust BPM to experiment with transitions
6. Use the breadcrumb trail to map out your mix

Browser Support
- Chrome / Edge 88+
- Firefox 87+
- Safari 14+

Known Limitations
- Max file size: 10MB
- Only supports XML format
- Requires BPM and key info in the file

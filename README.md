# Rubik's Timer Vibe

A modern, feature-rich Rubik's cube timer application built with React. This application provides speedcubers with a clean interface for timing solves, generating scrambles, and tracking statistics.

![Rubik's Timer Vibe Screenshot](screenshot.png)

## Features

- **Clean, Minimalist Interface**: Focus on what matters - your solve times
- **Professional Timer Controls**: 
  - Start/stop with spacebar (like competition timers)
  - Visual ready state indicator
  - Large, easy-to-read display
- **3D Cube Visualization**:
  - Interactive 3D Rubik's cube that matches the current scramble
  - Rotates during timing for visual feedback
  - Accurate colors and cube state representation
- **Comprehensive Scramble Generation**:
  - Random scrambles using standard WCA notation
  - Clear, readable scramble display
- **Solve Management**:
  - Record and store solve times
  - Add +2 penalties or mark solves as DNF
  - Delete unwanted solves
- **Statistics**:
  - Current session stats
  - Average of 5 (Ao5)
  - Average of 12 (Ao12)
  - Best and worst times
- **Persistent Storage**:
  - Automatically saves solve history to local storage
  - Your data remains between sessions

## Technologies Used

- **React**: Modern component-based UI
- **Three.js/React Three Fiber**: 3D cube visualization
- **Local Storage API**: Persistent data storage
- **CSS3**: Responsive design and animations

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/rubicks-timer-vibe.git
   cd rubicks-timer-vibe
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Starting/Stopping the Timer**:
   - Press and hold the spacebar until the timer turns green
   - Release the spacebar to start the timer
   - Press the spacebar again to stop the timer

2. **Managing Solves**:
   - Use the +2 button to add a penalty
   - Use the DNF button to mark a solve as Did Not Finish
   - Use the X button to delete a solve

3. **Viewing Statistics**:
   - Statistics are automatically calculated and updated after each solve
   - The Ao5 and Ao12 will appear once you have enough solves

## Future Enhancements

- Different puzzle types (2x2, 4x4, etc.)
- More advanced statistics
- Dark/light mode toggle
- Customizable UI colors
- Scramble visualization for different puzzle types
- User accounts and online solve storage
- Competition simulation mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
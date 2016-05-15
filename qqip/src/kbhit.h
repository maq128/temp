/* KBHIT.c
 *
 * Utility function prototypes to support charactor keyboard mode on Linux
 *
 */

#ifndef KBHITh
#define KBHITh

// create charactor mode termios
void init_keyboard(void);

// restore keyboard to the original state
void original_keyboard(void);

// change keyboard to the charactor mode
void char_keyboard(void);

// simulate Windows kbhit() to detect key presses
int kbhit(void);

// simulate Windows getch() to read one key input
int getch(void);

#endif

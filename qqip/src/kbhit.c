/// KBHIT.c
///
/// Utility functions to simulate Windows character keyboard mode to present
/// a consistent user interface as the original sample program.
///

#include "kbhit.h"
#include <termios.h>
#include <unistd.h>
#include <stdio.h>
#include <ctype.h>

static struct termios original_settings;
static struct termios char_settings;
static int peek_character = -1;

// Initialize keyboard setting structures
//
void init_keyboard()
{
   tcgetattr(STDIN_FILENO,&original_settings);  // preserve original keyboard
   char_settings = original_settings;
   char_settings.c_lflag &= ~ICANON;   // change to character mode
   char_settings.c_lflag &= ~ECHO;     // turn off keyboard echo
   char_settings.c_lflag &= ~ISIG;     // disable signals
   char_settings.c_cc[VMIN] = 1;
   char_settings.c_cc[VTIME] = 0;
}

// Set the keyboard to the character mode
//
void char_keyboard()
{
   tcsetattr(STDIN_FILENO, TCSANOW, &char_settings);
}

// Restore keyboard to the original mode
//
void original_keyboard()
{
   tcsetattr(STDIN_FILENO, TCSANOW, &original_settings);
}

// Simulation of Windows kbhit()
//
// @return      Status of keyboard detection: 1=key pressed, 0=none
int kbhit()
{
   unsigned char ch;
   int nread;

   if (peek_character != -1) return 1;
   char_settings.c_cc[VMIN]=0;
   tcsetattr(STDIN_FILENO, TCSANOW, &char_settings);
   nread = read(STDIN_FILENO,&ch,1);
   char_settings.c_cc[VMIN]=1;
   tcsetattr(STDIN_FILENO, TCSANOW, &char_settings);
   if(nread == 1) 
   {
      peek_character = ch;
      return 1;
   }
   return 0;
}

// Simulation of Windows getch()
//
// @return      The key code of the key pressed
int getch()
{
   char ch;

   if(peek_character != -1) 
   {
      ch = peek_character;
      peek_character = -1;
      return ch;
   }
   read(STDIN_FILENO,&ch,1);
   return ch;
}

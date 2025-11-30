#include "encode.h"

// Key expansion function
void KeyExpansion(uint8_t *key, uint8_t *w)
{
    uint8_t temp[4];
    int i = 0;

    // Copy initial key
    while (i < 16)
    {
        w[i] = key[i];
        i++;
    }

    i = 16;
    while (i < 176)
    {
        // Copy previous word
        temp[0] = w[i - 4];
        temp[1] = w[i - 3];
        temp[2] = w[i - 2];
        temp[3] = w[i - 1];

        if (i % 16 == 0)
        {
            // RotWord
            uint8_t t = temp[0];
            temp[0] = temp[1];
            temp[1] = temp[2];
            temp[2] = temp[3];
            temp[3] = t;

            // SubWord
            temp[0] = sbox[temp[0]];
            temp[1] = sbox[temp[1]];
            temp[2] = sbox[temp[2]];
            temp[3] = sbox[temp[3]];

            // XOR with Rcon
            temp[0] ^= Rcon[i / 16];
        }

        w[i] = w[i - 16] ^ temp[0];
        w[i + 1] = w[i - 15] ^ temp[1];
        w[i + 2] = w[i - 14] ^ temp[2];
        w[i + 3] = w[i - 13] ^ temp[3];

        i += 4;
    }
}

// AddRoundKey operation
void AddRoundKey(AES_State *state, uint8_t *round_key)
{
    for (int i = 0; i < 4; i++)
    {
        for (int j = 0; j < 4; j++)
        {
            state->state[j][i] ^= round_key[i * 4 + j];
        }
    }
}

// SubBytes operation
void SubBytes(AES_State *state)
{
    for (int i = 0; i < 4; i++)
    {
        for (int j = 0; j < 4; j++)
        {
            state->state[i][j] = sbox[state->state[i][j]];
        }
    }
}

// ShiftRows operation
void ShiftRows(AES_State *state)
{
    uint8_t temp;

    // Row 1: shift left 1
    temp = state->state[1][0];
    state->state[1][0] = state->state[1][1];
    state->state[1][1] = state->state[1][2];
    state->state[1][2] = state->state[1][3];
    state->state[1][3] = temp;

    // Row 2: shift left 2
    temp = state->state[2][0];
    state->state[2][0] = state->state[2][2];
    state->state[2][2] = temp;
    temp = state->state[2][1];
    state->state[2][1] = state->state[2][3];
    state->state[2][3] = temp;

    // Row 3: shift left 3 (or right 1)
    temp = state->state[3][3];
    state->state[3][3] = state->state[3][2];
    state->state[3][2] = state->state[3][1];
    state->state[3][1] = state->state[3][0];
    state->state[3][0] = temp;
}

// xtime function for MixColumns
uint8_t xtime(uint8_t x)
{
    return ((x << 1) ^ (((x >> 7) & 1) * 0x1b));
}

// MixColumns operation
void MixColumns(AES_State *state)
{
    uint8_t a, b, c, d;

    for (int i = 0; i < 4; i++)
    {
        a = state->state[0][i];
        b = state->state[1][i];
        c = state->state[2][i];
        d = state->state[3][i];

        state->state[0][i] = xtime(a) ^ xtime(b) ^ b ^ c ^ d;
        state->state[1][i] = a ^ xtime(b) ^ xtime(c) ^ c ^ d;
        state->state[2][i] = a ^ b ^ xtime(c) ^ xtime(d) ^ d;
        state->state[3][i] = xtime(a) ^ a ^ b ^ c ^ xtime(d);
    }
}

// Main AES encryption function
void AES_Encrypt(uint8_t *input, uint8_t *output, uint8_t *key)
{
    AES_State state;
    uint8_t round_keys[176];

    // Expand key
    KeyExpansion(key, round_keys);

    // Copy input to state
    for (int i = 0; i < 4; i++)
    {
        for (int j = 0; j < 4; j++)
        {
            state.state[j][i] = input[i * 4 + j];
        }
    }

    // Initial round
    AddRoundKey(&state, round_keys);

    // Main rounds
    for (int round = 1; round < 10; round++)
    {
        SubBytes(&state);
        ShiftRows(&state);
        MixColumns(&state);
        AddRoundKey(&state, round_keys + round * 16);
    }

    // Final round
    SubBytes(&state);
    ShiftRows(&state);
    AddRoundKey(&state, round_keys + 160);

    // Copy state to output
    for (int i = 0; i < 4; i++)
    {
        for (int j = 0; j < 4; j++)
        {
            output[i * 4 + j] = state.state[j][i];
        }
    }
}

void print_hex(uint8_t *data, int len)
{
    for (int i = 0; i < len; i++)
    {
        Serial.print("0x");
        Serial.print(data[i], HEX);
        Serial.print(" ");
    }
    Serial.print("\n");
}
void print_char(uint8_t *data, int len)
{
    for (int i = 0; i < len; i++)
    {
        Serial.print((char)data[i]);
    }
    Serial.print("\n");
}


#include "decode.h" 

uint8_t xtime(uint8_t x)
{
    return ((x << 1) ^ (((x >> 7) & 1) * 0x1b));
}
void KeyExpansiondecode(uint8_t *key, uint8_t *w)
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

void InvSubBytes(AES_State *state)
{
    for (int i = 0; i < 4; i++)
    {
        for (int j = 0; j < 4; j++)
        {
            state->state[i][j] = inv_sbox[state->state[i][j]];
        }
    }
}

void InvShiftRows(AES_State *state)
{
    uint8_t temp;

    // Row 1: shift right 1
    temp = state->state[1][3];
    state->state[1][3] = state->state[1][2];
    state->state[1][2] = state->state[1][1];
    state->state[1][1] = state->state[1][0];
    state->state[1][0] = temp;

    // Row 2: shift right 2
    temp = state->state[2][0];
    state->state[2][0] = state->state[2][2];
    state->state[2][2] = temp;
    temp = state->state[2][1];
    state->state[2][1] = state->state[2][3];
    state->state[2][3] = temp;

    // Row 3: shift right 3 (or left 1)
    temp = state->state[3][0];
    state->state[3][0] = state->state[3][1];
    state->state[3][1] = state->state[3][2];
    state->state[3][2] = state->state[3][3];
    state->state[3][3] = temp;
}

uint8_t Multiply(uint8_t x, uint8_t y)
{
    return (((y & 1) * x) ^
            ((y >> 1 & 1) * xtime(x)) ^
            ((y >> 2 & 1) * xtime(xtime(x))) ^
            ((y >> 3 & 1) * xtime(xtime(xtime(x)))) ^
            ((y >> 4 & 1) * xtime(xtime(xtime(xtime(x))))));
}

void InvMixColumns(AES_State *state)
{
    uint8_t a, b, c, d;

    for (int i = 0; i < 4; i++)
    {
        a = state->state[0][i];
        b = state->state[1][i];
        c = state->state[2][i];
        d = state->state[3][i];

        state->state[0][i] = Multiply(a, 0x0e) ^ Multiply(b, 0x0b) ^ Multiply(c, 0x0d) ^ Multiply(d, 0x09);
        state->state[1][i] = Multiply(a, 0x09) ^ Multiply(b, 0x0e) ^ Multiply(c, 0x0b) ^ Multiply(d, 0x0d);
        state->state[2][i] = Multiply(a, 0x0d) ^ Multiply(b, 0x09) ^ Multiply(c, 0x0e) ^ Multiply(d, 0x0b);
        state->state[3][i] = Multiply(a, 0x0b) ^ Multiply(b, 0x0d) ^ Multiply(c, 0x09) ^ Multiply(d, 0x0e);
    }
}
void AES_Decrypt(uint8_t *input, uint8_t *output, uint8_t *key)
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
    AddRoundKey(&state, round_keys + 160);

    // Main rounds
    for (int round = 9; round > 0; round--)
    {
        InvShiftRows(&state);
        InvSubBytes(&state);
        AddRoundKey(&state, round_keys + round * 16);
        InvMixColumns(&state);
    }

    // Final round
    InvShiftRows(&state);
    InvSubBytes(&state);
    AddRoundKey(&state, round_keys);

    // Copy state to output
    for (int i = 0; i < 4; i++)
    {
        for (int j = 0; j < 4; j++)
        {
            output[i * 4 + j] = state.state[j][i];
        }
    }
}
int compare_arrays(uint8_t *a, uint8_t *b, int len)
{
    for (int i = 0; i < len; i++)
    {
        if (a[i] != b[i])
        {
            return 0;
        }
    }
    return 1;
}
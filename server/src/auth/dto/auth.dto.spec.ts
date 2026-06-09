import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './login.dto';

async function validateDto(plain: object) {
  const dto = plainToInstance(LoginDto, plain);
  return validate(dto);
}

describe('LoginDto', () => {
  it('passes with valid email and password', async () => {
    const errors = await validateDto({
      email: 'client@demo.fr',
      password: 'password123',
    });
    expect(errors).toHaveLength(0);
  });

  it('fails with invalid email format', async () => {
    const errors = await validateDto({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('fails with missing email', async () => {
    const errors = await validateDto({ password: 'password123' });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('fails with password shorter than 8 characters', async () => {
    const errors = await validateDto({
      email: 'client@demo.fr',
      password: 'short',
    });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('fails with empty password', async () => {
    const errors = await validateDto({ email: 'client@demo.fr', password: '' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('fails with missing password', async () => {
    const errors = await validateDto({ email: 'client@demo.fr' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});

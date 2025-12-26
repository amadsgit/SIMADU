export {}

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/auth/login/page'

// MOCKS

// mock router
const replaceMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}))

// mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  getSession: jest.fn(),
}))

// mock toast (JANGAN pakai variabel luar)
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

// import mocked functions SETELAH jest.mock
import { signIn, getSession } from 'next-auth/react'

// TEST CASES

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('menampilkan halaman login', () => {
    render(<LoginPage />)

    expect(screen.getByText('LOGIN SIMADU')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /login/i })
    ).toBeInTheDocument()
  })

  it('menampilkan error jika password kurang dari 8 karakter', () => {
    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { name: 'password', value: '12345' },
    })

    expect(screen.getByText('Minimal 8 karakter')).toBeInTheDocument()
  })

  it('menampilkan loading saat submit login', async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ error: null })
    ;(getSession as jest.Mock).mockResolvedValue({
      user: { role: 'admin' },
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'admin@test.com' },
    })

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { name: 'password', value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findByText(/loading/i)).toBeInTheDocument()
  })

  it('login gagal dan menampilkan alert error', async () => {
    ;(signIn as jest.Mock).mockResolvedValue({
      error: 'Email atau password salah',
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@test.com' },
    })

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { name: 'password', value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Email atau password salah')
      ).toBeInTheDocument()
    })

    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('login berhasil dan redirect ke dashboard admin', async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ error: null })
    ;(getSession as jest.Mock).mockResolvedValue({
      user: { role: 'admin' },
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'admin@test.com' },
    })

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { name: 'password', value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/dashboard/admin')
    })
  })

  it('login berhasil dan redirect ke dashboard kader', async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ error: null })
    ;(getSession as jest.Mock).mockResolvedValue({
      user: { role: 'kader' },
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'kader@test.com' },
    })

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { name: 'password', value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/dashboard/kader')
    })
  })
})

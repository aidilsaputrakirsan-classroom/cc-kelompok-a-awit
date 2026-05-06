import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Header from '../Header'
// 1. Tambahkan import ThemeProvider ini:
import { ThemeProvider } from '../../context/ThemeContext' 

describe('Header Component', () => {
  it('menampilkan judul aplikasi', () => {
    // 2. Bungkus Header dengan ThemeProvider
    render(
      <ThemeProvider>
        <Header totalItems={0} />
      </ThemeProvider>
    )
    // Sepertinya judulmu diganti jadi PalmChain, bukan cloud
    expect(screen.getByText(/PalmChain/i)).toBeInTheDocument() 
  })

  it('menampilkan jumlah total items', () => {
    // 3. Bungkus juga di sini
    render(
      <ThemeProvider>
        <Header totalItems={5} />
      </ThemeProvider>
    )
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })
})
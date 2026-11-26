import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import SortDropdown from './SortDropdown'
import BlurFilterBar from './BlurFilterBar'
import CatalogueDropdown from './CatalogueDropdown'
import { BROWSE_SORTS } from '@/lib/productSorts'

vi.mock('next/navigation', () => ({ usePathname: () => '/bekleidung' }))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => true }))

afterEach(cleanup)

// Queries by role skip closed (inert/hidden) content only if asked to, so each test opens the menu.
const open = () => fireEvent.click(screen.getByText('Sortieren', { selector: 'button' }))
const lineLinks = () =>
  [...document.querySelectorAll('a[href^="/bekleidung/"]')].map(a => a.textContent)

describe('Sortieren with the catalogue lines', () => {
  const renderMenu = () => {
    const onSort = vi.fn()
    const onLine = vi.fn()
    render(
      <SortDropdown sorts={BROWSE_SORTS} value="empfohlen" onChange={onSort}
        catalogue={{ value: '', onChange: onLine }} />,
    )
    open()
    return { onSort, onLine }
  }

  it('lists the sorts, then the five lines with Star last', () => {
    renderMenu()

    for (const sort of BROWSE_SORTS) expect(screen.getByRole('button', { name: sort.label })).toBeTruthy()
    expect(lineLinks()).toEqual(['Streetwear', 'Experimental', 'Athleisure', 'Culture', 'Star'])
    const lastSort = screen.getByRole('button', { name: BROWSE_SORTS.at(-1)!.label })
    const firstLine = screen.getByRole('link', { name: 'Streetwear' })
    expect(lastSort.compareDocumentPosition(firstLine) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('reports a chosen sort and a chosen line separately', () => {
    const { onSort, onLine } = renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Preis aufsteigend' }))
    expect(onSort).toHaveBeenCalledWith('preis-auf')
    expect(onLine).not.toHaveBeenCalled()

    open()
    const culture = screen.getByRole('link', { name: 'Culture' })
    expect(culture.getAttribute('href')).toBe('/bekleidung/cultural')
    fireEvent.click(culture)
    expect(onLine).toHaveBeenCalledWith('culture')
    expect(onSort).toHaveBeenCalledTimes(1)
  })

  it('stays a plain sort menu when no catalogue is passed', () => {
    render(<SortDropdown sorts={BROWSE_SORTS} value="empfohlen" onChange={() => {}} />)
    open()

    expect(lineLinks()).toEqual([])
  })
})

describe('phone scroll bar', () => {
  const renderBar = (catalogueInSort?: boolean) =>
    render(
      <BlurFilterBar watchRef={{ current: null }} selectedGenders={[]} onGenderToggle={() => {}}
        activeFilterCount={0} onOpenFilter={() => {}} onOpenAt={() => {}} sortValue="empfohlen"
        onSort={() => {}} sorts={BROWSE_SORTS} catalogueValue="" onCatalogue={() => {}}
        catalogueInSort={catalogueInSort} />,
    )

  it('offers the lines in Sortieren only on pages that ask for it', () => {
    renderBar(true)
    expect(lineLinks()).toHaveLength(5)
    cleanup()

    renderBar()
    expect(lineLinks()).toEqual([])
  })
})

describe('closed menus leave nothing visible', () => {
  const highlight = () => document.querySelector<HTMLElement>('.catalogue-menu-highlight')!

  it.each([
    ['Sortieren', <SortDropdown key="s" sorts={BROWSE_SORTS} value="empfohlen" onChange={() => {}} catalogue={{ value: '', onChange: () => {} }} />],
    ['Star', <CatalogueDropdown key="c" value="star" />],
  ])('shows the highlight of the "%s" menu only while it is open', (trigger, menu) => {
    render(menu)
    expect(highlight().style.opacity).toBe('0')

    fireEvent.click(screen.getByText(trigger, { selector: 'button' }))
    expect(highlight().style.opacity).toBe('1')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(highlight().style.opacity).toBe('0')
  })
})

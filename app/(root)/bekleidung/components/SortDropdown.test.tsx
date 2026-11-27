import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import SortDropdown from './SortDropdown'
import BlurFilterBar from './BlurFilterBar'
import CatalogueDropdown from './CatalogueDropdown'
import { BROWSE_SORTS } from '@/lib/productSorts'

vi.mock('next/navigation', () => ({ usePathname: () => '/bekleidung' }))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => true }))

afterEach(cleanup)

const open = () => fireEvent.click(screen.getByText('Sortieren', { selector: 'button' }))
const menu = () => document.querySelector<HTMLElement>('.catalogue-menu')!
const highlight = () => document.querySelector<HTMLElement>('.catalogue-menu-highlight')!
const rows = () => [...document.querySelectorAll('.catalogue-menu-item')].map(r => r.textContent)

describe('Sortieren in the Catalogue menu design', () => {
  const renderMenu = (value = BROWSE_SORTS[0].id) => {
    const onChange = vi.fn()
    render(<SortDropdown sorts={BROWSE_SORTS} value={value} onChange={onChange} />)
    return onChange
  }

  it('lists only the sorts, as Catalogue menu rows', () => {
    renderMenu()
    open()

    expect(rows()).toEqual(BROWSE_SORTS.map(s => s.label))
    expect(document.querySelectorAll('a')).toHaveLength(0)
  })

  it('rests the highlight on the current sort and lets it follow the pointer', () => {
    renderMenu(BROWSE_SORTS[1].id)
    open()
    expect(highlight().style.transform).toContain('1 * var(--catalogue-row)')

    fireEvent.mouseEnter(screen.getByRole('button', { name: BROWSE_SORTS[2].label }))
    expect(highlight().style.transform).toContain('2 * var(--catalogue-row)')

    fireEvent.mouseLeave(menu())
    expect(highlight().style.transform).toContain('1 * var(--catalogue-row)')
  })

  it('reports the chosen sort and closes', () => {
    const onChange = renderMenu()
    open()

    fireEvent.click(screen.getByRole('button', { name: BROWSE_SORTS[2].label }))
    expect(onChange).toHaveBeenCalledWith(BROWSE_SORTS[2].id)
    expect(menu().dataset.open).toBe('false')
  })

  it('keeps the closed menu out of reach', () => {
    renderMenu()
    expect(menu().hasAttribute('inert')).toBe(true)
    open()
    expect(menu().hasAttribute('inert')).toBe(false)
  })
})

describe('phone scroll bar', () => {
  it('has no catalogue lines in Sortieren', () => {
    render(
      <BlurFilterBar watchRef={{ current: null }} selectedGenders={[]} onGenderToggle={() => {}}
        activeFilterCount={0} onOpenFilter={() => {}} onOpenAt={() => {}} sortValue={BROWSE_SORTS[0].id}
        onSort={() => {}} sorts={BROWSE_SORTS} catalogueValue="" onCatalogue={() => {}} />,
    )

    expect(rows()).toEqual(BROWSE_SORTS.map(s => s.label))
  })
})

describe('closed menus leave nothing visible', () => {
  it.each([
    ['Sortieren', <SortDropdown key="s" sorts={BROWSE_SORTS} value={BROWSE_SORTS[0].id} onChange={() => {}} />],
    ['Star', <CatalogueDropdown key="c" value="star" />],
  ])('shows the highlight of the "%s" menu only while it is open', (trigger, element) => {
    render(element)
    expect(highlight().style.opacity).toBe('0')

    fireEvent.click(screen.getByText(trigger, { selector: 'button' }))
    expect(highlight().style.opacity).toBe('1')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(highlight().style.opacity).toBe('0')
  })
})

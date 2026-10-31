import { test } from 'node:test'
import { assert, readFileSync, path, React, renderToStaticMarkup, root, userId, cafeId, reportBody, load } from './helpers.mjs'

const english = JSON.parse(readFileSync(path.join(root, 'src/lib/i18n/locales/en.json'), 'utf8'))
const shopOverrides = {
  '@/context/languageContext': { useTranslation: () => ({ t: english }) },
}

test('shop details display the same time-limit semantics as the report form', () => {
  const { ShopDetail } = load('src/components/shopInfo.tsx', {}, undefined, shopOverrides, '\nexports.ShopDetail = ShopDetail;')
  for (const [timeLimit, expected, absent] of [[false, 'No time limit', 'Time limited'], [true, 'Time limited', 'No time limit']]) {
    const markup = renderToStaticMarkup(React.createElement(ShopDetail, {shopInfo: {
      ...reportBody, timeLimit, allowCigaretteType: [], _count: { reports: 1 },
    }}))
    assert.ok(markup.includes(expected))
    assert.equal(markup.includes(absent), false)
  }
})

test('report form retains failed input and refreshes details after success', async () => {
  let succeeded = false, refreshes = 0, detailRefreshes = 0, closed = 0, errors = 0
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('{}', {status: succeeded ? 201 : 500})
  try {
    const { ShopForm } = load('src/components/shopInfo.tsx', {}, undefined, {
      ...shopOverrides,
      react: {...React, useEffect: () => {}},
      '@/context/authContext': { useAuth: () => ({user: {id: userId}, refreshUser: async () => {refreshes++} }) },
      'react-hook-form': { useForm: () => ({ control: {}, formState: {isSubmitting: false}, handleSubmit: fn => fn }) },
      sonner: { toast: { error: () => {errors++} } },
    }, '\nexports.ShopForm = ShopForm;')
    const element = ShopForm({shopInfo: {id: cafeId}, setIsEditing: () => {closed++}, onReported: async id => {assert.equal(id, cafeId); detailRefreshes++} })
    await element.props.children.props.onSubmit(reportBody)
    assert.equal(errors, 1)
    assert.equal(refreshes, 0)
    assert.equal(closed, 0)
    succeeded = true
    await element.props.children.props.onSubmit(reportBody)
    assert.equal(refreshes, 1)
    assert.equal(detailRefreshes, 1)
    assert.equal(closed, 1)
  } finally { globalThis.fetch = originalFetch }
})

test('no-time-limit map filter includes false and excludes true or unknown', () => {
  const cafes = [false, true, null].map((timeLimit, i) => ({id: String(i), timeLimit, location: {lat: 35, lng: 139}}))
  const filters = {hasWifi: false, hasSmokingArea: false, hasPowerOutlets: false, timeLimit: true, isBookingRequired: false, minConsumption: false}
  const {default: Map} = load('src/components/map.tsx', {}, undefined, {
    ...shopOverrides,
    react: {...React, useEffect: () => {}, useCallback: fn => fn, useMemo: fn => fn(), useRef: value => ({current:value}),
      useState: value => [Array.isArray(value) ? cafes : value && typeof value === 'object' && 'timeLimit' in value ? filters : value, () => {}]},
    '@/context/authContext': {useAuth: () => ({user:null})},
    '@react-google-maps/api': {useJsApiLoader: () => ({isLoaded:true}), GoogleMap: () => null},
  })
  const markers = []
  const visit = node => {
    if (Array.isArray(node)) return node.forEach(visit)
    if (!node || typeof node !== 'object') return
    if (node.type?.name === 'CafeLocationDot') markers.push(node.key)
    visit(node.props?.children)
  }
  visit(Map({setShopId: () => {}}))
  assert.deepEqual(markers, ['0'])
})

import { afterEach } from 'vitest'
import { expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend vitest's expect with jest-dom matchers
expect.extend(matchers)

// RTL's auto-cleanup can't find afterEach when globals:false — wire it explicitly
afterEach(cleanup)

import getServerlessApp from '@snek-at/functions/dist/server/getServerlessApp.js'

export async function handler(event: Object, context: Object) {
  return await getServerlessApp({
    functions: '.'
  })(event, context)
}

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at

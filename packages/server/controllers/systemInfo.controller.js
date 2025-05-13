const axios = require('axios')
const config = require('config')
const { logger } = require('@coko/server')
const packageJson = require('../package.json')

const serviceIdentifierTiDisplayNameMapper = {
  epubChecker: 'EPUBChecker microservice',
  icml: 'ICML microservice',
  pagedjs: 'PagedJS microservice',
  xsweet: 'XSweet microservice',
}

const isWorkingChecker = async servicesInfo => {
  const callHealthcheckEndpoints = servicesInfo.map(serviceInfo => {
    const { healthcheckURL, displayName } = serviceInfo
    return axios
      .get(healthcheckURL)
      .then(response => ({
        displayName,
        healthcheckURL,
        isWorking: response.status === 200,
      }))
      .catch(() => ({
        displayName,
        healthcheckURL,
        isWorking: false,
      }))
  })

  return Promise.all(callHealthcheckEndpoints.map(async response => response))
}

const gatherServiceInfo = () => {
  try {
    if (!config.has('services')) {
      throw new Error('configuration for the services needed')
    }

    if (!config.has('fileStorage')) {
      throw new Error('configuration for the file server needed')
    }

    const services = config.get('services')

    const serviceInfo = Object.keys(services).map(serviceName => ({
      displayName: serviceIdentifierTiDisplayNameMapper[serviceName],
      healthcheckURL: `${services[serviceName].url}/healthcheck`,
    }))

    const fileStorage = config.get('fileStorage')

    serviceInfo.push({
      displayName: 'File Storage service',
      healthcheckURL: `${fileStorage.url}/minio/health/live`,
    })

    return serviceInfo
  } catch (e) {
    logger.error(e.message)
    throw new Error(e.message)
  }
}

const getSystemInfo = async () => {
  try {
    const { version } = packageJson
    const systemInfoData = { version }

    const servicesInfo = gatherServiceInfo()

    systemInfoData.healthcheck = await isWorkingChecker(servicesInfo)

    return systemInfoData
  } catch (e) {
    logger.error(e.message)
    throw new Error(e.message)
  }
}

module.exports = {
  getSystemInfo,
}

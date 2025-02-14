export const environment = {
  production: true,
  country: 'cl',
  IVA: 0.19,
  // APIs
  apiCustomer: 'https://dev-api.implementos.cl/api/cliente/',
  // Images Urls
  urlFotoOmnichannel:
    'http://replicacion.implementos.cl/siteomnichannel/fotos/',
  // Images
  logoSrcWhite: 'assets/images/logos/logo_white.PNG',
  logoSrc: 'assets/images/logos/logo_header.svg',
  logoSrcFooter: 'assets/images/logos/logo_header2.PNG',
  // Base
  canonical: 'https://dev.devimplementos.cl',

  urlPagosImplementos: 'https://pagos.implementos.cl/',
  // Carro de compras
  urlNotificaciones: 'https://dev-api.implementos.cl/api/notificaciones',
  // No Env.
  urlPaymentOmniCanceled:
    'https://dev.devimplementos.cl/carro-compra/omni-forma-de-pago',
  urlPaymentOmniVoucher:
    'https://dev.devimplementos.cl/carro-compra/omni-gracias-por-tu-compra/',
  // Nuevo Ecommerce
  apiEcommerce: 'https://dev-api.implementos.cl/ecommerce',
  basicAuthUser: 'services',
  basicAuthPass: '0.=j3D2ss1.w29-',
  imageUrl: 'https://images.implementos.cl',
  gmapScript:
    'https://maps.googleapis.com/maps/api/js?key=AIzaSyD_HuwF5F8X8fOSR_1Ai_hFT115caUq4vI&libraries=places&callback=Function.prototype',
  webChatScript:
    'https://webchat-cls3-cl.i6.inconcertcc.com/v3/click_to_chat?token=6436ADDF32C3F2240B1FC31C54D6AB3B',
  // TODELETE
  apiElastic: 'https://b2b-api.implementos.cl/api/articulo/',

  // Sucursal por defecto a enviar a las apis. (Si no existe ninguna seleccionada)
  defaultBranch: {
    zone: 'San Bernardo',
    code: 'SAN BRNRDO',
    city: 'SAN BERNARDO',
  },
  isSearchVehicleVisible: true,
};

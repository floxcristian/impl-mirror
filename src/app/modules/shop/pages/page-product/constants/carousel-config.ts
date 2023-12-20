import { OwlOptions } from 'ngx-owl-carousel-o';

export const CarouselDesktopOptions: OwlOptions = {
  items: 6,
  nav: true,
  navText: [
    `<i class="fas fa-chevron-left"></i>`,
    `<i class="fas fa-chevron-right"></i>`,
  ],
  dots: true,
  slideBy: 'page',
  responsive: {
    1366: { items: 6 },
    1100: { items: 6 },
    920: { items: 6 },
    680: { items: 3 },
    500: { items: 3 },
    0: { items: 2 },
  },
};

export const CarouselMobileOptions: OwlOptions = {
  items: 6,
  nav: false,
  dots: true,
  slideBy: 'page',
  merge: true,
  responsive: {
    1366: { items: 6 },
    1100: { items: 6 },
    920: { items: 6 },
    680: { items: 3 },
    500: { items: 3 },
    0: { items: 5, nav: false, mergeFit: true },
  },
};

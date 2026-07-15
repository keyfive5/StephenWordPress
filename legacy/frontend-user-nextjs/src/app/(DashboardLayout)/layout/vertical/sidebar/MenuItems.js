import { uniqueId } from 'lodash';
import {
  IconAperture,
  IconUsers,
  IconBook2,
  IconCalendarCheck,
  IconCategory,
  IconChevronDown,
  IconChevronRight,
  IconMenuOrder,
  IconPencil
} from '@tabler/icons-react';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconAperture,
    href: '/',
  },
  {
    id: uniqueId(),
    title: 'Categories',
    icon: IconCalendarCheck,
    href: '/categories',
  },
  {
    id: uniqueId(),
    title: 'Sub categories',
    icon: IconCalendarCheck,
    href: '/subcategories',
  },
  {
    id: uniqueId(),
    title: 'Products',
    icon: IconCalendarCheck,
    href: '/products',
  },
  {
    id: uniqueId(),
    title: 'Orders',
    icon: IconMenuOrder,
    href: '/order',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Customizer',
  //   icon: IconPencil,
  //   href: '/custoimizer',
  // },  
];

export default Menuitems;

import '../popover.css';
import { Content, type DropdownContentProps } from './Content';
import { type DropdownProps, Dropdown as DropdownRoot } from './Dropdown';
import { type DropdownFooterProps, Footer } from './Footer';
import { type DropdownGroupProps, Group } from './Group';
import { type DropdownHeaderProps, Header } from './Header';
import { type DropdownItemProps, Item } from './Item';
import { type DropdownExternalLinkProps, type DropdownLinkProps, Link } from './Link';
import { type DropdownSeparatorProps, Separator } from './Separator';

export type { DropdownSize } from './context';
export { useDropdownContext } from './context';

export type {
  DropdownExternalLinkProps,
  DropdownFooterProps,
  DropdownGroupProps,
  DropdownHeaderProps,
  DropdownItemProps,
  DropdownLinkProps,
  DropdownContentProps,
  DropdownProps,
  DropdownSeparatorProps,
};

export { Footer as DropdownFooter };
export { Group as DropdownGroup };
export { Header as DropdownHeader };
export { Item as DropdownItem };
export { Link as DropdownLink };
export { Content as DropdownContent };
export { Separator as DropdownSeparator };

type DropdownCompound = typeof DropdownRoot & {
  Item: typeof Item;
  Link: typeof Link;
  Content: typeof Content;
  Group: typeof Group;
  Header: typeof Header;
  Footer: typeof Footer;
  Separator: typeof Separator;
};

const Dropdown = DropdownRoot as DropdownCompound;

Dropdown.Item = Item;
Dropdown.Link = Link;
Dropdown.Content = Content;
Dropdown.Group = Group;
Dropdown.Header = Header;
Dropdown.Footer = Footer;
Dropdown.Separator = Separator;

export { Dropdown };
export default Dropdown;

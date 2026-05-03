import Masonry from 'react-masonry-css';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const breakpointColumnsObj = {
  default: 5,
  1400: 4,
  1100: 3,
  700: 2,
  500: 1
};

export function MasonryGrid({ children }: Props) {
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {children}
    </Masonry>
  );
}

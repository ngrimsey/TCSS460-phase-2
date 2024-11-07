export interface IRatings {
    average: number;
    count: number;
    rating_1_star: number;
    rating_2_star: number;
    rating_3_star: number;
    rating_4_star: number;
    rating_5_star: number;
}

export interface IUrlIcon {
    large: string;
    small: string;
}

export interface IBook {
    id: number;
    isbn13: number;
    authors: string;
    publication_year: number;
    title: string;
    ratings: IRatings;
    icons: IUrlIcon;
}

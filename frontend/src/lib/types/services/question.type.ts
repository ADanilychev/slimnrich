interface IQuestion {
    key: string;
    title: string;
    subtitle: string;
    required: boolean;
    answers: [
        {
            is_slider: boolean;
            answers: unknown[];
            value: string;
            text: string;
            another_button: boolean;
            icon: string;
        },
    ];
    max_select: number;
    free_input: boolean;
    lang: string;
}

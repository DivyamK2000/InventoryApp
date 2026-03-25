type ExpiryInput =
    | { expiryDate: Date; mfd?: never; bestBefore?: never }
    | { expiryDate?: never; mfd: Date; bestBefore: {
        value: number;
        unit: "day" | "week" | "month" | "year";
    }};

type CalcExpiryInput = {
    mfd: Date,
    bestBefore: {
        value: number,
        unit: "day" | "week" | "month" | "year";
    }
}

export const calcExpiry = ({ mfd, bestBefore }: CalcExpiryInput): Date => {
    const expiry = new Date(mfd);

    switch (bestBefore.unit) {
        case "day":
            expiry.setDate(expiry.getDate() + bestBefore.value);
            break;
        case "week":
            expiry.setDate(expiry.getDate() + bestBefore.value * 7);
            break;
        case "month":
            const day = expiry.getDate();
            expiry.setDate(1);
            expiry.setMonth(expiry.getMonth() + bestBefore.value);

            const maxDay = new Date(
                expiry.getFullYear(),
                expiry.getMonth() + 1,
                0
            ).getDate();

            expiry.setDate(Math.min(day, maxDay));
            break;
        case "year":
            expiry.setFullYear(expiry.getFullYear() + bestBefore.value);
            break;
    }

    return expiry;
}

export const resolveExpiry = (input: ExpiryInput) => {
    if("expiryDate" in input) {
        return {
            expiryDate: input.expiryDate
        };
    }

    const expiryDate = calcExpiry({
        mfd: input.mfd,
        bestBefore: input.bestBefore
    });

    return {
        expiryDate,
        mfd: input.mfd,
        bestBefore: input.bestBefore
    };
}


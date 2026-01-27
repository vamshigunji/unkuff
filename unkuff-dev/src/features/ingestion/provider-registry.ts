import { BaseProvider } from "./base-provider";
import { JoobleProvider } from "./providers/jooble";
import { ArbeitnowProvider } from "./providers/arbeitnow";
import { ApifyIndeedProvider } from "./providers/apify-indeed";
import { ApifyLinkedinProvider } from "./providers/apify-linkedin";
import { TheirStackProvider } from "./providers/theirstack";
import { MockProvider } from "./providers/mock-provider";
import { ProviderConfig } from "./types";

export function getEnabledProviders(configs: Record<string, ProviderConfig>): BaseProvider[] {
    const providers: BaseProvider[] = [];

    if (configs.jooble?.enabled) {
        providers.push(new JoobleProvider(configs.jooble));
    }

    if (configs.arbeitnow?.enabled) {
        providers.push(new ArbeitnowProvider(configs.arbeitnow));
    }

    if (configs.apifyIndeed?.enabled) {
        providers.push(new ApifyIndeedProvider(configs.apifyIndeed));
    }

    if (configs.apifyLinkedin?.enabled) {
        providers.push(new ApifyLinkedinProvider(configs.apifyLinkedin));
    }

    if (configs.theirstack?.enabled) {
        providers.push(new TheirStackProvider(configs.theirstack));
    }

    if (configs.mock?.enabled) {
        providers.push(new MockProvider(configs.mock));
    }

    return providers;
}

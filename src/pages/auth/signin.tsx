import type { InferGetServerSidePropsType } from "next";
import { getProviders, signIn } from "next-auth/react";

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button
            onClick={() =>
              void signIn(provider.id, {
                callbackUrl: "/",
              })
            }
          >
            {provider.name} アカウントでサインインする
          </button>
        </div>
      ))}
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers: providers ?? [] },
  };
}

import { Frontmatter } from "xmatter/schema";

type Link = NonNullable<Frontmatter["links"]>[number];

export function FrontmatterLink({ link }: { link: Link }) {
  if (link.name === "website") return <Website link={link} />;
  if (link.name === "x") return <X link={link} />;
  if (link.name === "github") return <GitHub link={link} />;
  if (link.name === "telegram") return <Telegram link={link} />;
  if (link.name === "coinmarketcap") return <CoinMarketCap link={link} />;
  if (link.name === "discord") return <Discord link={link} />;
  if (link.name === "youtube") return <YouTube link={link} />;
  if (link.name === "reddit") return <Reddit link={link} />;
  if (link.name === "medium") return <Medium link={link} />;
  if (link.name === "facebook") return <Facebook link={link} />;
  if (link.name === "forum") return <Forum link={link} />;
  if (link.name === "coingecko") return <CoinGecko link={link} />;
  if (link.name === "whitepaper") return <Whitepaper link={link} />;
  if (link.name === "blog") return <Blog link={link} />;
  if (link.name === "docs") return <Docs link={link} />;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 16 16">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          strokeLinejoin="round"
          d="M8.46968 1.46968C10.1433 -0.203925 12.8567 -0.203923 14.5303 1.46968C16.2039 3.14329 16.2039 5.85674 14.5303 7.53034L12.0303 10.0303L10.9697 8.96968L13.4697 6.46968C14.5575 5.38186 14.5575 3.61816 13.4697 2.53034C12.3819 1.44252 10.6182 1.44252 9.53034 2.53034L7.03034 5.03034L5.96968 3.96968L8.46968 1.46968ZM11.5303 5.53034L5.53034 11.5303L4.46968 10.4697L10.4697 4.46968L11.5303 5.53034ZM1.46968 14.5303C3.14329 16.2039 5.85673 16.204 7.53034 14.5303L10.0303 12.0303L8.96968 10.9697L6.46968 13.4697C5.38186 14.5575 3.61816 14.5575 2.53034 13.4697C1.44252 12.3819 1.44252 10.6182 2.53034 9.53034L5.03034 7.03034L3.96968 5.96968L1.46968 8.46968C-0.203923 10.1433 -0.203925 12.8567 1.46968 14.5303Z"
          fill="currentColor"
        />
      </svg>
      <span>{new URL(link.url).host + (new URL(link.url).pathname === "/" ? "" : new URL(link.url).pathname)}</span>
    </a>
  );
}

function Website({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 16 16">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          strokeLinejoin="round"
          d="M8.46968 1.46968C10.1433 -0.203925 12.8567 -0.203923 14.5303 1.46968C16.2039 3.14329 16.2039 5.85674 14.5303 7.53034L12.0303 10.0303L10.9697 8.96968L13.4697 6.46968C14.5575 5.38186 14.5575 3.61816 13.4697 2.53034C12.3819 1.44252 10.6182 1.44252 9.53034 2.53034L7.03034 5.03034L5.96968 3.96968L8.46968 1.46968ZM11.5303 5.53034L5.53034 11.5303L4.46968 10.4697L10.4697 4.46968L11.5303 5.53034ZM1.46968 14.5303C3.14329 16.2039 5.85673 16.204 7.53034 14.5303L10.0303 12.0303L8.96968 10.9697L6.46968 13.4697C5.38186 14.5575 3.61816 14.5575 2.53034 13.4697C1.44252 12.3819 1.44252 10.6182 2.53034 9.53034L5.03034 7.03034L3.96968 5.96968L1.46968 8.46968C-0.203923 10.1433 -0.203925 12.8567 1.46968 14.5303Z"
          fill="currentColor"
        />
      </svg>
      <span className="">{new URL(link.url).host}</span>
    </a>
  );
}

function X({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 16 16">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.5 0.5H5.75L9.48421 5.71053L14 0.5H16L10.3895 6.97368L16.5 15.5H11.25L7.51579 10.2895L3 15.5H1L6.61053 9.02632L0.5 0.5ZM12.0204 14L3.42043 2H4.97957L13.5796 14H12.0204Z"
          fill="currentColor"
        />
      </svg>
      <span>{new URL(link.url).pathname.split("/").pop()}</span>
    </a>
  );
}

function GitHub({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 16 16">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 0C3.58 0 0 3.57879 0 7.99729C0 11.5361 2.29 14.5251 5.47 15.5847C5.87 15.6547 6.02 15.4148 6.02 15.2049C6.02 15.0149 6.01 14.3851 6.01 13.7154C4 14.0852 3.48 13.2255 3.32 12.7757C3.23 12.5458 2.84 11.836 2.5 11.6461C2.22 11.4961 1.82 11.1262 2.49 11.1162C3.12 11.1062 3.57 11.696 3.72 11.936C4.44 13.1455 5.59 12.8057 6.05 12.5957C6.12 12.0759 6.33 11.726 6.56 11.5261C4.78 11.3262 2.92 10.6364 2.92 7.57743C2.92 6.70773 3.23 5.98797 3.74 5.42816C3.66 5.22823 3.38 4.40851 3.82 3.30888C3.82 3.30888 4.49 3.09895 6.02 4.1286C6.66 3.94866 7.34 3.85869 8.02 3.85869C8.7 3.85869 9.38 3.94866 10.02 4.1286C11.55 3.08895 12.22 3.30888 12.22 3.30888C12.66 4.40851 12.38 5.22823 12.3 5.42816C12.81 5.98797 13.12 6.69773 13.12 7.57743C13.12 10.6464 11.25 11.3262 9.47 11.5261C9.76 11.776 10.01 12.2558 10.01 13.0056C10.01 14.0752 10 14.9349 10 15.2049C10 15.4148 10.15 15.6647 10.55 15.5847C12.1381 15.0488 13.5182 14.0284 14.4958 12.6673C15.4735 11.3062 15.9996 9.67293 16 7.99729C16 3.57879 12.42 0 8 0Z"
          fill="currentColor"
        />
      </svg>
      <span>{new URL(link.url).pathname.split("/").filter(Boolean).slice(0, 2).join("/")}</span>
    </a>
  );
}

function Telegram({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 24 24">
        <path
          d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
          fill="currentColor"
        />
      </svg>
      <span>{new URL(link.url).pathname.split("/").pop()}</span>
    </a>
  );
}

function CoinMarketCap({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 24 24">
        <path
          d="M20.738 14.341c-.419.265-.912.298-1.286.087-.476-.27-.738-.898-.738-1.774v-2.618c0-1.264-.5-2.164-1.336-2.407-1.416-.413-2.482 1.32-2.882 1.972l-2.498 4.05v-4.95c-.028-1.14-.398-1.821-1.1-2.027-.466-.135-1.161-.081-1.837.953l-5.597 8.987A9.875 9.875 0 0 1 2.326 12c0-5.414 4.339-9.818 9.672-9.818 5.332 0 9.67 4.404 9.67 9.818.004.018.002.034.003.053.05 1.049-.29 1.883-.933 2.29zm3.08-2.34-.001-.055C23.787 5.353 18.497 0 11.997 0 5.48 0 .177 5.383.177 12c0 6.616 5.303 12 11.82 12 2.991 0 5.846-1.137 8.037-3.2.435-.41.46-1.1.057-1.541a1.064 1.064 0 0 0-1.519-.059 9.56 9.56 0 0 1-6.574 2.618c-2.856 0-5.425-1.263-7.197-3.268l5.048-8.105v3.737c0 1.794.696 2.374 1.28 2.544.584.17 1.476.054 2.413-1.468.998-1.614 2.025-3.297 3.023-4.88v2.276c0 1.678.672 3.02 1.843 3.68 1.056.597 2.384.543 3.465-.14 1.312-.828 2.018-2.354 1.944-4.193z"
          fill="currentColor"
        />
      </svg>
      <span>CoinMarketCap</span>
    </a>
  );
}

function Discord({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 24 24">
        <path
          d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
          fill="currentColor"
        />
      </svg>
      <span>Discord</span>
    </a>
  );
}

function YouTube({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 24 24">
        <path
          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
          fill="currentColor"
        />
      </svg>
      <span>YouTube</span>
    </a>
  );
}

function Reddit({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 24 24">
        <path
          d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"
          fill="currentColor"
        />
      </svg>
      <span>Reddit</span>
    </a>
  );
}

function Medium({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 24 24">
        <path
          d="M4.21 0A4.201 4.201 0 0 0 0 4.21v15.58A4.201 4.201 0 0 0 4.21 24h15.58A4.201 4.201 0 0 0 24 19.79v-1.093c-.137.013-.278.02-.422.02-2.577 0-4.027-2.146-4.09-4.832a7.592 7.592 0 0 1 .022-.708c.093-1.186.475-2.241 1.105-3.022a3.885 3.885 0 0 1 1.395-1.1c.468-.237 1.127-.367 1.664-.367h.023c.101 0 .202.004.303.01V4.211A4.201 4.201 0 0 0 19.79 0Zm.198 5.583h4.165l3.588 8.435 3.59-8.435h3.864v.146l-.019.004c-.705.16-1.063.397-1.063 1.254h-.003l.003 10.274c.06.676.424.885 1.063 1.03l.02.004v.145h-4.923v-.145l.019-.005c.639-.144.994-.353 1.054-1.03V7.267l-4.745 11.15h-.261L6.15 7.569v9.445c0 .857.358 1.094 1.063 1.253l.02.004v.147H4.405v-.147l.019-.004c.705-.16 1.065-.397 1.065-1.253V6.987c0-.857-.358-1.094-1.064-1.254l-.018-.004zm19.25 3.668c-1.086.023-1.733 1.323-1.813 3.124H24V9.298a1.378 1.378 0 0 0-.342-.047Zm-1.862 3.632c-.1 1.756.86 3.239 2.204 3.634v-3.634z"
          fill="currentColor"
        />
      </svg>
      <span>Medium</span>
    </a>
  );
}

function Facebook({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 24 24">
        <path
          d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
          fill="currentColor"
        />
      </svg>
      <span>Facebook</span>
    </a>
  );
}

function Forum({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg
        height="14"
        width="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1" />
      </svg>
      <span>{new URL(link.url).host}</span>
    </a>
  );
}

function CoinGecko({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg height="14" width="14" viewBox="0 0 32 33" fill="none">
        <path
          d="M31.9998 16.203C32.0398 25.1032 24.9085 32.3503 16.0727 32.3906C7.23579 32.4309 0.0401701 25.2485 0.000167472 16.3482C-0.0398351 7.44801 7.09154 0.200848 15.9285 0.160559C24.7642 0.121491 31.9598 7.30272 31.9998 16.203Z"
          fill="var(--color-mono-300)"
        />
        <path
          d="M24.1145 10.509C22.9532 10.1708 21.7507 9.68979 20.5313 9.2051C20.4609 8.89743 20.1906 8.51408 19.6427 8.04404C18.8463 7.34813 17.3504 7.36645 16.0582 7.67411C14.6315 7.33593 13.2217 7.21506 11.8689 7.54225C0.80633 10.6128 7.07826 18.1004 3.01617 25.6296C3.59439 26.8639 9.97171 32.7942 18.8378 32.1357C18.8378 32.1357 15.7552 24.6749 22.712 21.0928C28.3548 18.1884 32.4314 12.7945 24.1133 10.5078L24.1145 10.509Z"
          fill="var(--color-mono-600)"
        />
        <path
          d="M16.8243 12.3042C16.8243 14.0256 15.4388 15.4199 13.7308 15.4199C12.0228 15.4199 10.6373 14.0256 10.6373 12.3042C10.6373 10.5827 12.0228 9.1897 13.7308 9.1897C15.4388 9.1897 16.8243 10.5839 16.8243 12.3042Z"
          fill="var(--color-mono-50)"
        />
        <path
          d="M27.9862 16.7882C25.4806 18.567 22.6283 19.9161 18.5856 19.9161C16.6933 19.9161 16.3091 17.8906 15.0581 18.8832C14.412 19.396 12.1355 20.5424 10.3281 20.4557C8.50493 20.3678 5.59444 19.3007 4.77621 15.4171C4.45255 19.3007 4.28769 22.1625 2.83911 25.4418C6.39506 30.6678 12.5951 33.2679 18.8377 32.1371C18.1674 27.4208 22.2598 22.8022 24.5654 20.4386C25.4382 19.5437 27.111 18.0823 27.9862 16.7882Z"
          fill="var(--color-mono-600)"
        />
        <path
          d="M15.0348 14.8244C16.0374 14.8244 16.8501 13.6865 16.8501 12.2829C16.8501 10.8793 16.0374 9.74146 15.0348 9.74146C14.0322 9.74146 13.2195 10.8793 13.2195 12.2829C13.2195 13.6865 14.0322 14.8244 15.0348 14.8244Z"
          fill="var(--color-mono-950)"
        />
        <path
          d="M15.7609 7.6682C16.7513 8.06406 20.3681 9.26871 21.933 9.74159C20.3352 7.09051 17.914 7.24349 15.7609 7.6682Z"
          fill="var(--color-mono-700)"
        />
        <path d="M15.0347 12.2826L12.8563 10.8303V13.7348L15.0347 12.2826Z" fill="var(--color-mono-50)" />
      </svg>
      <span>CoinGecko</span>
    </a>
  );
}

function Whitepaper({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg
        height="14"
        width="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* If you know, you know. */}
        <path d="M4 13V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5" />
        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
        <path d="M10 22v-5" />
        <path d="M14 19v-2" />
        <path d="M18 20v-3" />
        <path d="M2 13h20" />
        <path d="M6 20v-3" />
      </svg>
      <span>Whitepaper</span>
    </a>
  );
}

function Blog({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg
        height="14"
        width="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 11a9 9 0 0 1 9 9" />
        <path d="M4 4a16 16 0 0 1 16 16" />
        <circle cx="5" cy="19" r="1" />
      </svg>
      <span>{new URL(link.url).host}</span>
    </a>
  );
}

function Docs({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-mono-600 flex cursor-pointer items-center gap-1"
    >
      <svg
        height="14"
        width="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
        <path d="M8 11h8" />
        <path d="M8 7h6" />
      </svg>
      <span>{new URL(link.url).host + (new URL(link.url).pathname === "/" ? "" : new URL(link.url).pathname)}</span>
    </a>
  );
}

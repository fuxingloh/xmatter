import Image from "next/image";

export function IconsTab(props: { chainId: string; address: string; icons: string[] }) {
  const icon = props.icons[0];

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <h4 className="text-mono-500 text-sm">ICONS</h4>
        <div>
          {props.icons.map((icon) => (
            <div key={icon} className="flex items-center gap-2">
              {icon}
            </div>
          ))}
        </div>
      </div>
      <div className="border-mono-200 grid grid-cols-2 overflow-hidden rounded-lg border">
        <div className="bg-mono-50 text-mono-950 flex items-end justify-center gap-4 p-6">
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={16} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={32} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={48} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={64} />
        </div>
        <div className="bg-mono-950 text-mono-100 flex items-end justify-center gap-4 p-6">
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={16} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={32} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={48} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={64} />
        </div>
      </div>
    </div>
  );
}

function IconImage(props: { chainId: string; address: string; icon: string; size: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Image
        src={`/eip155/${props.chainId}/${props.address}/${props.icon}`}
        alt={`${props.address} icon`}
        width={64}
        height={64}
        style={{ width: props.size, height: props.size }}
      />
      <h6 className="text-sm">
        {props.size}x{props.size}
      </h6>
    </div>
  );
}

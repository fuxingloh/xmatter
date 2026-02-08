export default function Loading() {
  return (
    <div className="grid gap-12 pb-48 lg:grid-cols-10">
      <main className="lg:col-span-7">
        <div className="mb-4">
          <div className="bg-mono-200/75 mb-1 h-8 w-48 animate-pulse rounded" />
          <div className="bg-mono-200/75 h-5 w-80 animate-pulse rounded" />

          <div className="mt-15 flex flex-wrap items-center gap-x-6 gap-y-1">
            <div className="bg-mono-200/75 h-5 w-28 animate-pulse rounded" />
            <div className="bg-mono-200/75 h-5 w-32 animate-pulse rounded" />
            <div className="bg-mono-200/75 h-5 w-24 animate-pulse rounded" />
          </div>
        </div>

        <div className="flex flex-col gap-12">
          <div className="border-mono-200/75 flex flex-wrap items-center gap-x-12 gap-y-6 border-y py-6">
            <div>
              <h4 className="text-mono-500 text-sm">CHAIN</h4>
              <div className="bg-mono-200/75 mt-1 h-5 w-24 animate-pulse rounded" />
            </div>
            <div>
              <h4 className="text-mono-500 text-sm">CHAIN ID</h4>
              <div className="bg-mono-200/75 mt-1 h-5 w-20 animate-pulse rounded" />
            </div>
            <div>
              <h4 className="text-mono-500 text-sm">ICON COLOR</h4>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="bg-mono-200/75 h-5 w-16 animate-pulse rounded" />
                <div className="bg-mono-200/75 size-4 animate-pulse rounded-xs" />
              </div>
            </div>
            <div>
              <h4 className="text-mono-500 text-sm">SYMBOL</h4>
              <div className="bg-mono-200/75 mt-1 h-5 w-14 animate-pulse rounded" />
            </div>
            <div>
              <h4 className="text-mono-500 text-sm">DECIMALS</h4>
              <div className="bg-mono-200/75 mt-1 h-5 w-8 animate-pulse rounded" />
            </div>
          </div>

          <div>
            <div className="bg-mono-200/75 h-48 w-full animate-pulse rounded" />
          </div>

          <div>
            <div className="bg-mono-200/75 h-10 w-full animate-pulse rounded" />
          </div>

          <div>
            <h4 className="text-mono-500 mb-2 text-sm">README</h4>
            <div className="flex flex-col gap-2">
              <div className="bg-mono-200/75 h-4 w-full animate-pulse rounded" />
              <div className="bg-mono-200/75 h-4 w-full animate-pulse rounded" />
              <div className="bg-mono-200/75 h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-mono-200/75 h-4 w-5/6 animate-pulse rounded" />
            </div>
          </div>

          <div className="border-mono-200 border-t pt-8">
            <div className="bg-mono-200/75 h-64 w-full animate-pulse rounded" />
          </div>
        </div>
      </main>

      <aside className="border-mono-200 flex flex-col gap-8 max-lg:border-t max-lg:pt-12 lg:col-span-3">
        <div>
          <h4 className="text-mono-500 mb-2 text-sm">PROVENANCE</h4>
          <div className="bg-mono-200/75 h-5 w-40 animate-pulse rounded" />
        </div>

        <div>
          <h4 className="text-mono-500 mb-2 text-sm">TAGS</h4>
          <div className="flex items-center gap-2">
            <div className="bg-mono-200/75 h-7 w-16 animate-pulse rounded-sm" />
            <div className="bg-mono-200/75 h-7 w-20 animate-pulse rounded-sm" />
          </div>
        </div>

        <div>
          <h4 className="text-mono-500 mb-2 text-sm">STANDARDS</h4>
          <div className="flex items-center gap-2">
            <div className="bg-mono-200/75 h-7 w-16 animate-pulse rounded-sm" />
            <div className="bg-mono-200/75 h-7 w-14 animate-pulse rounded-sm" />
          </div>
        </div>
      </aside>
    </div>
  );
}

import type { DialogContent } from "@/shared/stores";

export const useFaqModal = (): DialogContent => ({
  isOpen: true,
  title: "FAQ",
  functions: [],
  classNames: {
    dialogContent: "max-w-[50vw] flex flex-col gap-4",
  },
  content: (
    <div className="flex flex-col gap-4 text-left text-sm leading-relaxed">
      <section>
        <h3 className="text-lg font-semibold">What is Unfurl?</h3>
        <p>
          The tool that can take your extensive dialogs you wrote in Twine or
          in other markdown formats and visualize, edit and convert them to a
          JSON format for your game!
          <br />
          If you want to test it out, you can use the demo file{" "}
          <span className="font-bold">(Hold Control + T + N)</span>.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold">
          How do I use these files in my game?
        </h3>
        <p>
          You can use these files in your game by importing them as a JSON
          file. This can change depending on how you&apos;re building your
          game. For example, in Unity, you&apos;ll need to build your own
          dialog manager and import the JSON file as a text asset.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold">
          Can I use Unfurl for my own project?
        </h3>
        <p>
          <span className="font-bold">Yes!</span> Unfurl is open-source and
          free to use. You can find the source code on{" "}
          <a
            className="cursor-pointer text-info underline-offset-4 hover:underline"
            href="https://github.com/HitBox38/Unfurl"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold">
          What are the supported formats?
        </h3>
        <p>Unfurl supports the following formats:</p>
        <ul className="ml-5 list-disc">
          <li className="font-bold">twee (Twine)</li>
          <li className="font-bold">
            markdown (.md files, compatible with tools like Obsidian)
          </li>
          <li className="font-bold">JSON</li>
        </ul>
      </section>
      <section>
        <h3 className="text-lg font-semibold">How can I contribute?</h3>
        <p>
          Unfurl is open-source and free to use. You can find the source code
          on{" "}
          <a
            className="cursor-pointer text-info underline-offset-4 hover:underline"
            href="https://github.com/HitBox38/Unfurl"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          . If you find a bug or have a feature request,{" "}
          <a
            className="cursor-pointer text-info underline-offset-4 hover:underline"
            href="https://github.com/HitBox38/Unfurl/issues"
            target="_blank"
            rel="noreferrer"
          >
            you can create an issue on GitHub
          </a>
          .
        </p>
      </section>
    </div>
  ),
});

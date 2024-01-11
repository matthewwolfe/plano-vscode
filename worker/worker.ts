import { generate } from 'plano-cli';
import { parentPort } from 'worker_threads';

parentPort!.on('message', async ({ type, data }) => {
  switch (type) {
    case 'import': {
      try {
        const { prompts } = await import(data.modulePath);

        return parentPort!.postMessage({
          type: 'context-prompts',
          prompts,
        });
      } catch (e) {
        console.log(e);

        return parentPort!.postMessage({
          type: 'context-prompts',
          prompts: {},
        });
      }
    }

    case 'generate': {
      try {
        const { helpers } = await import(data.modulePath);

        generate({
          copyToPath: data.copyToPath,
          context: data.context,
          helpers,
          template: data.template,
        });

        return parentPort!.postMessage({
          type: 'generate-success',
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
});

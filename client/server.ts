import { 
	Application, 
	Context,
	ListenOptions, 
	ListenOptionsBase, 
	ListenOptionsTls,
	Router,
} from '../deps.ts';
import { logger, timer, staticFiles, notFound } from './middlewares.ts';
import { getValue } from '../utils/mod.ts';

/**
 * APIOptions lists all options for the APIServer.
 * 
 * None are required as APIServer has default alternatives set in place.
 */
export interface ClientOptions {
	port?: number,
	host?: string,
	useTLS?: boolean,
	cert?: string,
	key?: string,
	baseEndpoint: string,
}

/**
 * APIServer is the server that will return data from the SMTP Server's database.
 */
export class ClientServer {
	public app: Application = new Application();

	public router: Router = new Router();

	baseEndpoint: string;

	constructor(opts: ClientOptions) {
		this.baseEndpoint = opts.baseEndpoint;
		this._prepareApp(opts);
	}

	private async _prepareApp(opts: ClientOptions) {
		await this._compileReactApp();
		this._setupMiddlewaresAndRoutes();
		this._startListening(opts);
	}

	private async _compileReactApp() {
		const encoder = new TextEncoder();
		const index = './client/app/index.tsx';
		console.log("🛠  Compiling client app");
		const [diagnostics, output] = await Deno.bundle(index, undefined, {
			target: 'es5'
		});
		await Deno.writeFile('client/app/dist/js/bundle.js', encoder.encode(output), {});
	}

	private _getOptions(opts: ClientOptions): ListenOptions {
		opts.host = opts.host || "0.0.0.0";
		opts.port = opts.port || 5000;

		return opts.useTLS ? this._getTLSOptions(opts) : this._getBaseOptions(opts);
	}
	private _getBaseOptions(opts: ClientOptions): ListenOptionsBase {
		return {
			hostname: opts.host,
			port: opts.port as number
		};
	}

	private _getTLSOptions(opts: ClientOptions):ListenOptionsTls {
		return {
			hostname: opts.host,
			port: opts.port as number,
			certFile: getValue(opts, "cert", true) as string,
			keyFile: getValue(opts, "key", true) as string,
			secure: true,
		}
	}

	private _setupMiddlewaresAndRoutes() {
		const root = `${Deno.cwd()}/client/app`;
		const index = 'index.html';

		async function redirect(context: Context) {
			context.response.headers.set("X-Context-Send", "true");
			await context.send({
				root,
				path: index,
			});
		}

		this.router
			.get('/', redirect)
			.get('/message/:id', redirect)
			.get('/settings', redirect)
			// Setting up proxy to the API
			.all('/api/(.*)', async (context: Context) => {
				const response = await fetch(`${this.baseEndpoint}${context.request.url.pathname}${context.request.url.search}`, {
					method: context.request.method
				});
				context.response.headers.set("Content-Type", "application/json");
				context.response.body = await response.json();
			});


		this.app.use(logger);
		this.app.use(timer);
		this.app.use(this.router.routes());
		this.app.use(this.router.allowedMethods());
		this.app.use(staticFiles);
		this.app.use(notFound);
	}

	private async _startListening(opts: ClientOptions) {
		let listeningOptions = this._getOptions(opts);

		console.log(`🌎 Client Server listening at ${listeningOptions.hostname}:${listeningOptions.port}.`);
		await this.app.listen(listeningOptions);
	}
}
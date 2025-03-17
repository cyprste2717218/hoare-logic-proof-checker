import {Button} from '@/components/ui/button.js';
import {Input} from '@/components/ui/input.js';
import {AppSidebar} from '@/components/app-sidebar.js';
import {Separator} from '@/components/ui/separator.js';
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar.js';
import './App.css';

function App() {
	return (
		<>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 h-4" />
							<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
								{' '}
								Hoare Logic Proof Validator{' '}
							</h1>
						</div>
					</header>
					<Separator orientation="horizontal" />

					<div>
						<p
							style={{textAlign: 'left'}}
							className="leading-7 [&:not(:first-child)]:mt-6"
						>
							Enter Your Hoare Triple:
						</p>
						<Input />
					</div>
					<br></br>
					<div>
						<p
							style={{textAlign: 'left'}}
							className="leading-7 [&:not(:first-child)]:mt-6"
						>
							Enter Your Proof:
						</p>
						<Input />
					</div>

					<Button variant="outline">Check Proof Validity</Button>
				</SidebarInset>
			</SidebarProvider>
		</>
	);
}

export default App;

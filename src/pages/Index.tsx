import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const Index = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="pt-12 pb-8 px-4">
                    <div className="container mx-auto text-center max-w-4xl">
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
                            Welcome to My App
                        </h1>
                        
                        <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                            A modern React application built with TypeScript, Tailwind CSS, and powerful UI components.
                        </p>
                        
                        <Button size="lg" className="mb-8">
                            Get Started
                        </Button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Modern Stack</CardTitle>
                                <CardDescription>
                                    Built with React 18, TypeScript, and Vite for fast development
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600">
                                    Enjoy the latest features and performance optimizations.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Beautiful UI</CardTitle>
                                <CardDescription>
                                    Styled with Tailwind CSS and Radix UI components
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600">
                                    Professional design system with accessible components.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Developer Ready</CardTitle>
                                <CardDescription>
                                    ESLint, TypeScript, and modern tooling configured
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600">
                                    Start building immediately with best practices in place.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Index;

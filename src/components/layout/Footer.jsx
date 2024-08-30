
function Footer() {
    const footerYear = new Date().getFullYear()

    return (
        <footer className="footer h-8 p-2 bg-neutral text-neutral-content footer-center" style={{position:"absolute", left:"0", bottom:"0", right:"0"}}>
            <p>Copyright &copy; Perana Sports {footerYear}. All rights reserved.</p>
        </footer>
    )
}

export default Footer
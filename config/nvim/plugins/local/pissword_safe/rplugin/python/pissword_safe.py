import neovim


@neovim.plugin
class Main(object):
    def __init__(self, nvim):
        self.nvim = nvim

    @neovim.function("TestFunction")
    def test_function(self, args):
        self.nvim.command('echo "hello"')
